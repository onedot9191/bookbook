#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Favicon 생성 스크립트"""

import sys
import os

# 출력 인코딩 설정
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

from PIL import Image

# 이미지 파일 경로
preferred_image = "assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_9dea88b61120c5d6802de57260a33007_images_image-3e039eb7-1874-4937-b9e4-b55d6c7f78be.png"
output_dir = "public"

print("Favicon 생성 시작...")
print(f"출력 디렉토리: {output_dir}")

# 출력 디렉토리 생성
os.makedirs(output_dir, exist_ok=True)
print(f"출력 디렉토리 생성 완료")

# 이미지 파일 찾기 및 열기
input_image = None
try:
    # 먼저 선호하는 이미지 파일 시도
    if os.path.exists(preferred_image):
        try:
            img = Image.open(preferred_image)
            input_image = preferred_image
            print(f"✓ 이미지 파일 로드 성공: {preferred_image}")
            print(f"  이미지 크기: {img.size}, 모드: {img.mode}")
        except Exception as e:
            print(f"⚠ 선호 이미지 파일을 열 수 없습니다: {e}")
            print("다른 이미지 파일을 찾는 중...")
    
    # 선호 이미지가 실패하면 assets 폴더에서 다른 이미지 찾기
    if input_image is None:
        assets_dir = "assets"
        if os.path.exists(assets_dir):
            png_files = [f for f in os.listdir(assets_dir) if f.lower().endswith('.png')]
            for png_file in png_files:
                file_path = os.path.join(assets_dir, png_file)
                try:
                    img = Image.open(file_path)
                    input_image = file_path
                    print(f"✓ 유효한 이미지 파일 발견: {file_path}")
                    print(f"  이미지 크기: {img.size}, 모드: {img.mode}")
                    break
                except Exception as e:
                    continue
    
    if input_image is None:
        print("❌ 오류: 유효한 이미지 파일을 찾을 수 없습니다.")
        sys.exit(1)
    
    print(f"사용할 이미지: {input_image}")
    
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
    print(f"\n생성된 파일 목록:")
    for file in os.listdir(output_dir):
        file_path = os.path.join(output_dir, file)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path)
            print(f"  - {file} ({size} bytes)")
    
except FileNotFoundError:
    print(f"❌ 오류: 이미지 파일을 찾을 수 없습니다: {input_image}")
    sys.exit(1)
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
