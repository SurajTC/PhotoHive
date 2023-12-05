from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import NoCredentialsError

from nanoid import generate
from PIL import Image
from datetime import datetime
from io import BytesIO
import base64
import os

DYNAMO_DB = "photohive-db"
S3_BUCKET = "photohive-storage"

CHAR_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
S3_OBJ_URL = f"https://{S3_BUCKET}.s3.amazonaws.com/"
TMP_DIR = "/tmp/"
THUMB_SIZE = 100

app = Flask(__name__)
CORS(app)

s3 = boto3.client("s3")
db = boto3.resource("dynamodb")
db_table = db.Table(DYNAMO_DB)


def decode_img(data, filename):
    path = os.path.join(TMP_DIR, filename)
    decoded = base64.b64decode(data)
    with open(path, "wb") as f:
        f.write(decoded)

    return path


def convert_img(filename, format="JPEG"):
    ip_img = Image.open(filename)
    ip_img = ip_img.convert("RGB")
    buffer = BytesIO()
    ip_img.convert("RGB").save(buffer, format=format)
    buffer.seek(0)

    return buffer, ip_img


def resize_img(img, thumb_height=THUMB_SIZE, format="JPEG"):
    width, height = img.size
    thumb_width = int((thumb_height / height) * width)

    thumb_img = img.resize((thumb_width, thumb_height))
    buffer = BytesIO()
    thumb_img.save(buffer, format=format)
    buffer.seek(0)

    return buffer


@app.route("/")
def index():
    return jsonify(message="Hello from INDEX")


@app.route("/photos", methods=["GET"])
def get_photos():
    search_query = request.args.get("search")

    filter_conditions = Attr("is_deleted").eq(False)

    if search_query:
        filter_conditions &= Attr("tags").contains(search_query) | Attr(
            "username"
        ).contains(search_query)

    response = db_table.scan(
        FilterExpression=filter_conditions,
        ProjectionExpression="id, last_updated, username, tags, thumb_url",
    )
    photos = response.get("Items", [])

    return jsonify({"data": photos})


@app.route("/photos/<string:photo_id>", methods=["GET"])
def get_photo(photo_id):
    response = db_table.query(
        FilterExpression=Attr("is_deleted").eq(False),
        KeyConditionExpression=Key("id").eq(photo_id),
        ProjectionExpression="id, last_updated, username, tags, image_url",
    )

    photo = response.get("Items", None)

    if photo:
        return jsonify({"data": photo})
    else:
        return make_response(jsonify(error="Key not found."), 404)


@app.route("/photos/<string:photo_id>", methods=["DELETE"])
def delete_photo(photo_id):
    key = {"id": photo_id}
    update_expression = "SET is_deleted = :deleted"
    expression_attribute_values = {":deleted": True}
    db_table.update_item(
        Key={"id": photo_id},
        UpdateExpression="SET is_deleted = :val",
        ExpressionAttributeValues={":val": True},
    )
    try:
        return jsonify({"data": photo_id})

    except Exception as e:
        return make_response(jsonify(error="Key not found."), 404)


@app.route("/photos", methods=["PUT"])
def put_photo():
    data = request.json

    username = data["metadata"]["username"]
    tags = data["metadata"]["tags"]
    image_base64 = data["image"]
    image_id = generate(CHAR_SET, 10)
    last_updated = datetime.now().isoformat()
    filename = f"{image_id}.jpg"

    if not username or not image_base64:
        return make_response(
            jsonify(error="Invalid request. Missing required fields."), 400
        )

    metadata = {
        "id": image_id,
        "last_updated": last_updated,
        "username": username,
        "image_url": f"{S3_OBJ_URL}{filename}",
        "thumb_url": f"{S3_OBJ_URL}.thumbnails/{filename}",
        "tags": list(set(tags)) or [],
        "is_deleted": False,
    }

    tmp_path = decode_img(image_base64, "img")
    image_buffer, image = convert_img(tmp_path)
    thumb_buffer = resize_img(image)

    try:
        s3.upload_fileobj(image_buffer, S3_BUCKET, filename)

    except NoCredentialsError:
        return make_response(jsonify(error="S3: Image upload failed."), 500)

    try:
        s3.upload_fileobj(thumb_buffer, S3_BUCKET, f".thumbnails/{filename}")

    except NoCredentialsError:
        return make_response(jsonify(error="S3: Thumbnail upload failed."), 500)

    try:
        db_table.put_item(Item=metadata)

    except:
        return make_response(jsonify(error="DynamoDB: Upload failed."), 500)

    return jsonify(body=metadata["id"])


@app.route("/tags", methods=["GET"])
def get_tags():
    search_query = request.args.get("search")

    filter_conditions = Attr("is_deleted").eq(False)

    if search_query:
        filter_conditions &= Attr("tags").contains(search_query)

    response = db_table.scan(
        FilterExpression=filter_conditions,
        ProjectionExpression="tags",
    )

    tags = response.get("Items", [])
    tags_flat = list(set([tag for item in tags for tag in item["tags"]]))

    if search_query:
        tags_flat = [element for element in tags_flat if search_query in element]

    return jsonify({"data": tags_flat})


@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error="Not found!"), 404)
