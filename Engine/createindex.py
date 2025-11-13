from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError, RequestError

# Kết nối tới Elasticsearch (localhost:9201)
es = Elasticsearch("http://localhost:9201")

index_name = "students"

# Xóa index nếu đã tồn tại
try:
    if es.indices.exists(index=index_name):
        es.indices.delete(index=index_name)
        print(f"Đã xóa index '{index_name}'")
except NotFoundError:
    print(f"Index '{index_name}' không tồn tại, bỏ qua bước xóa.")
except Exception as e:
    print("Lỗi khi xóa index:", e)

# Cấu hình mapping cho index
index_mapping = {
    "mappings": {
        "properties": {
            "student_id": {"type": "keyword"},
            "vector": {
                "type": "dense_vector",
                "dims": 512
            }
        }
    }
}

# Tạo lại index
try:
    es.indices.create(index=index_name, body=index_mapping)
    print(f"Đã tạo index '{index_name}' với mapping vector 512 chiều.")
except RequestError as e:
    print("Lỗi khi tạo index:", e.info)
except Exception as e:
    print("Lỗi không xác định:", e)
