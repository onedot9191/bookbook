#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Favicon 생성 스크립트"""

from PIL import Image
import os

# 이미지 파일 경로
input_image = "assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9dea88b61120c5d6802de57260a33007_images_image-3e039eb7-1874-4937-b9e4-b55d6c7f78be.png"
output_dir = "public"

# 출력 디렉토리 생성
os.makedirs(output_dir, exist_ok=True)

# 이미지 열기
try:
    img = Image.open(input_image)
    
    # 투명 배경이 있는지 확인하고, 필요시 RGBA로 변환
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 다양한 크기의 favicon 생성
    sizes = [
        (16, 16, 'favicon-16x16.png'),
        (32, 32, 'favicon-32x32.png'),
        (180, 180, 'apple-touch-icon.png'),
        (192, 192, 'android-chrome-192x192.png'),
        (512, 512, 'android-chrome-512x512.png'),
    ]
    
    for size, size2, filename in sizes:
        resized = img.resize((size, size2), Image.Resampling.LANCZOS)
        output_path = os.path.join(output_dir, filename)
        resized.save(output_path, 'PNG')
        print(f"✓ Created: {output_path}")
    
    # favicon.ico 파일 생성 (16x16, 32x32 포함)
    img16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    img32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    ico_path = os.path.join(output_dir, 'favicon.ico')
    img16.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32)])
    print(f"✓ Created: {ico_path}")
    
    print(f"\n✅ Favicon 생성 완료! ({len(sizes) + 1}개 파일)")
    
except FileNotFoundError:
    print(f"❌ 오류: 이미지 파일을 찾을 수 없습니다: {input_image}")
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
