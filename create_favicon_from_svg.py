#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SVG를 기반으로 Favicon 생성 스크립트"""

import os
from PIL import Image, ImageDraw
import xml.etree.ElementTree as ET

output_dir = "public"
os.makedirs(output_dir, exist_ok=True)

print("SVG 기반 Favicon 생성 시작...")

# 간단한 책 아이콘을 직접 그리기
def create_book_icon(size):
    """책 아이콘 이미지 생성"""
    # RGBA 모드로 투명 배경 생성
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 밝은 황금색/갈색 그라데이션 배경 (둥근 사각형)
    # 상단이 더 밝고 하단이 약간 어두운 그라데이션 효과로 가독성 향상
    for y in range(size):
        # 그라데이션 색상 계산 (밝은 황금색 계열)
        ratio = y / size
        r = int(255 + (230 - 255) * ratio)  # 255 -> 230 (더 밝게)
        g = int(215 + (180 - 215) * ratio)  # 215 -> 180
        b = int(80 + (50 - 80) * ratio)     # 80 -> 50
        draw.rectangle([(size*0.1, y), (size*0.9, y+1)], fill=(r, g, b, 255))
    
    # 둥근 모서리 효과를 위한 마스크
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_radius = size // 8
    mask_draw.rounded_rectangle([(0, 0), (size, size)], corner_radius, fill=255)
    
    # 마스크 적용
    img.putalpha(mask)
    
    # 책 윤곽선 그리기 (밝은 색으로 변경 - 가독성 향상)
    # 밝은 흰색으로 변경하여 다크 배경에서 잘 보이도록
    line_color = (255, 255, 255, 255)  # 밝은 흰색
    line_width = max(2, size // 15)  # 선 두께 증가
    
    # 위치 계산
    left_x = size * 0.35
    right_x = size * 0.65
    bottom_y = size * 0.8
    
    # 그림자 효과 (먼저 그리기 - 가독성 향상)
    shadow_color = (0, 0, 0, 120)  # 반투명 검은색 그림자
    shadow_offset = max(1, size // 30)
    shadow_width = line_width + 1
    
    # 그림자 그리기
    draw.line([(left_x + shadow_offset, size*0.25 + shadow_offset), 
                (left_x + shadow_offset, size*0.75 + shadow_offset)], 
               fill=shadow_color, width=shadow_width)
    draw.line([(right_x + shadow_offset, size*0.25 + shadow_offset), 
                (right_x + shadow_offset, size*0.75 + shadow_offset)], 
               fill=shadow_color, width=shadow_width)
    draw.line([(left_x + shadow_offset, size*0.25 + shadow_offset), 
                (right_x + shadow_offset, size*0.25 + shadow_offset)], 
               fill=shadow_color, width=shadow_width)
    draw.line([(left_x + shadow_offset, size*0.75 + shadow_offset), 
                (right_x + shadow_offset, size*0.75 + shadow_offset)], 
               fill=shadow_color, width=shadow_width)
    draw.line([(size*0.3 + shadow_offset, bottom_y + shadow_offset), 
                (size*0.7 + shadow_offset, bottom_y + shadow_offset)], 
               fill=shadow_color, width=shadow_width)
    
    # 밝은 윤곽선 그리기 (그림자 위에)
    draw.line([(left_x, size*0.25), (left_x, size*0.75)], fill=line_color, width=line_width)
    draw.line([(right_x, size*0.25), (right_x, size*0.75)], fill=line_color, width=line_width)
    draw.line([(left_x, size*0.25), (right_x, size*0.25)], fill=line_color, width=line_width)
    draw.line([(left_x, size*0.75), (right_x, size*0.75)], fill=line_color, width=line_width)
    draw.line([(size*0.3, bottom_y), (size*0.7, bottom_y)], fill=line_color, width=line_width)
    
    return img

# 다양한 크기의 favicon 생성
sizes = [
    (16, 16, 'favicon-16x16.png'),
    (32, 32, 'favicon-32x32.png'),
    (180, 180, 'apple-touch-icon.png'),
    (192, 192, 'android-chrome-192x192.png'),
    (512, 512, 'android-chrome-512x512.png'),
]

print("이미지 생성 중...")
for size, size2, filename in sizes:
    img = create_book_icon(size)
    output_path = os.path.join(output_dir, filename)
    img.save(output_path, 'PNG')
    print(f"✓ Created: {output_path}")

# favicon.ico 파일 생성
img16 = create_book_icon(16)
img32 = create_book_icon(32)
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
