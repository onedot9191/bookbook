#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""간단한 Favicon 생성 스크립트 (Pillow 없이)"""

import os
import shutil

# 이미지 파일 경로
input_image = "assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9dea88b61120c5d6802de57260a33007_images_image-3e039eb7-1874-4937-b9e4-b55d6c7f78be.png"
output_dir = "public"

# 출력 디렉토리 생성
os.makedirs(output_dir, exist_ok=True)

# 이미지 파일 확인
if not os.path.exists(input_image):
    print(f"❌ 오류: 이미지 파일을 찾을 수 없습니다: {input_image}")
    exit(1)

# 원본 이미지를 favicon으로 복사 (브라우저가 자동으로 크기 조정)
shutil.copy2(input_image, os.path.join(output_dir, "favicon.png"))
shutil.copy2(input_image, os.path.join(output_dir, "favicon.ico"))

print("✅ 기본 favicon 파일 생성 완료!")
print(f"  - public/favicon.png")
print(f"  - public/favicon.ico")
print("\n참고: Pillow를 설치하면 더 다양한 크기의 favicon을 생성할 수 있습니다.")
print("      설치 명령: python -m pip install Pillow")
