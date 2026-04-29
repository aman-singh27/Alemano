import cv2
import numpy as np
import os
import glob

def order_points(pts):
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def warp_to_square(image, pts, size=200):
    rect = order_points(pts)
    dst = np.array([
        [0, 0],
        [size - 1, 0],
        [size - 1, size - 1],
        [0, size - 1]], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(image, M, (size, size))

def count_black(binary, x, y, w, h):
    roi = binary[y:y+h, x:x+w]
    return cv2.countNonZero(roi)

def test_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return "Failed to load image"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    frameWidth = gray.shape[1]
    minArea = (frameWidth * 0.1) ** 2
    maxArea = (frameWidth * 0.9) ** 2
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < minArea or area > maxArea:
            continue
            
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        
        if len(approx) != 4:
            continue
            
        x, y, w, h = cv2.boundingRect(approx)
        aspect_ratio = w / float(h)
        if aspect_ratio < 0.8 or aspect_ratio > 1.2:
            continue
            
        pts = approx.reshape(4, 2)
        normalized = warp_to_square(thresh, pts, 200)
        
        # Check A: Border Uniformity
        size = 200
        ring = int(size * 0.1)
        black_pixels = (count_black(normalized, 0, 0, size, ring) + 
                       count_black(normalized, 0, size-ring, size, ring) +
                       count_black(normalized, 0, ring, ring, size - 2*ring) +
                       count_black(normalized, size-ring, ring, ring, size - 2*ring))
        
        total_pixels = (size*ring)*2 + (ring*(size-2*ring))*2
        if black_pixels / total_pixels < 0.85:
            continue
            
        # Check B: Inner Empty Zone
        start = int(size * 0.2)
        zone_size = int(size * 0.6)
        density = count_black(normalized, start, start, zone_size, zone_size) / (zone_size * zone_size)
        if density > 0.20:
            continue
            
        # Check C: Corner Anchor
        border = int(size * 0.1)
        inner_size = size - (border * 2)
        anchor_size = int(inner_size * 0.2)
        
        samples = [
            count_black(normalized, border, border, anchor_size, anchor_size),
            count_black(normalized, size - border - anchor_size, border, anchor_size, anchor_size),
            count_black(normalized, size - border - anchor_size, size - border - anchor_size, anchor_size, anchor_size),
            count_black(normalized, border, size - border - anchor_size, anchor_size, anchor_size)
        ]
        
        area_anchor = anchor_size * anchor_size
        densities = [s / area_anchor for s in samples]
        
        active = [i for i, d in enumerate(densities) if d >= 0.70]
        inactive = [d for i, d in enumerate(densities) if i not in active]
        
        if len(active) == 1 and all(d <= 0.15 for d in inactive):
            return f"PASS (Detected, Anchor Quadrant: {active[0]})"
            
    return "FAIL (No valid marker found)"

print("=== Testing Correct Images ===")
for img in glob.glob("test-images/correct/*.jpg"):
    print(f"{os.path.basename(img)}: {test_image(img)}")

print("\n=== Testing Incorrect Images ===")
for img in glob.glob("test-images/incorrect/*.jpg"):
    print(f"{os.path.basename(img)}: {test_image(img)}")
