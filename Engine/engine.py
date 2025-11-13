import base64
import os
import numpy as np
from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from insightface.app import FaceAnalysis
from PIL import Image
from io import BytesIO
import tempfile

# ======================
# Cấu hình hệ thống
# ======================
ES_HOST = "http://localhost:9201"
INDEX_NAME = "students"
SIMILARITY_THRESHOLD = 0.6  # ngưỡng cosine similarity

app = Flask(__name__)

# ======================
# Kết nối Elasticsearch
# ======================
es = Elasticsearch(ES_HOST)

# ======================
# Khởi tạo InsightFace model
# ======================
app_insight = FaceAnalysis(name='buffalo_l')
app_insight.prepare(ctx_id=0)  # GPU = 0, CPU = -1

# ======================
# Hàm tiện ích
# ======================

def decode_base64_to_image(base64_str):
    """Chuyển ảnh base64 thành đối tượng PIL.Image"""
    image_data = base64.b64decode(base64_str)
    image = Image.open(BytesIO(image_data))
    return image.convert("RGB")

def extract_face_vector(image):
    """Trích xuất vector khuôn mặt đầu tiên trong ảnh"""
    faces = app_insight.get(np.array(image))
    if len(faces) == 0:
        return None
    return faces[0].embedding.tolist()  # vector 512 chiều

def cosine_similarity(v1, v2):
    """Tính cosine similarity giữa 2 vector numpy"""
    v1, v2 = np.array(v1), np.array(v2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

# ======================
# API: Đăng ký khuôn mặt
# ======================
@app.route("/register", methods=["POST"])
def register_face():
    try:
        data = request.get_json()
        student_id = data.get("student_id")
        image_base64 = data.get("image")

        if not student_id or not image_base64:
            return jsonify({"error": "Thiếu student_id hoặc image"}), 400

        # Decode ảnh và trích xuất vector
        image = decode_base64_to_image(image_base64)
        vector = extract_face_vector(image)

        if vector is None:
            return jsonify({"error": "Không phát hiện được khuôn mặt"}), 400

        # Lưu document vào Elasticsearch
        doc = {
            "student_id": student_id,
            "vector": vector
        }
        es.index(index=INDEX_NAME, document=doc)
        return jsonify({"message": "Đăng ký khuôn mặt thành công", "student_id": student_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================
# API: Xác thực khuôn mặt
# ======================
@app.route("/verify", methods=["POST"])
def verify_face():
    try:
        data = request.get_json()
        image_base64 = data.get("image")

        if not image_base64:
            return jsonify({"error": "Thiếu image"}), 400

        # Decode ảnh và trích xuất vector
        image = decode_base64_to_image(image_base64)
        vector = extract_face_vector(image)

        if vector is None:
            return jsonify({"error": "Không phát hiện được khuôn mặt"}), 400

        # Tìm tất cả documents trong Elasticsearch
        res = es.search(index=INDEX_NAME, size=1000, query={"match_all": {}})
        hits = res.get("hits", {}).get("hits", [])

        matches = []
        for hit in hits:
            doc = hit["_source"]
            sim = cosine_similarity(vector, doc["vector"])
            if sim >= SIMILARITY_THRESHOLD:
                matches.append({
                    "student_id": doc["student_id"],
                    "similarity": float(sim)
                })

        # Sắp xếp theo độ tương đồng giảm dần
        matches = sorted(matches, key=lambda x: x["similarity"], reverse=True)

        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================
# Khởi chạy Flask app
# ======================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9595)
