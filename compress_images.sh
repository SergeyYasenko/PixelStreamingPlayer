#!/bin/bash

MAX_SIZE=800000
TEMP_DIR="temp_compress_$$"

mkdir -p "$TEMP_DIR"

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

get_file_size() {
    wc -c < "$1" 2>/dev/null | tr -d ' \n'
}

compress_image() {
    local input="$1"
    local output="$2"
    local target_size="$3"
    
    for scale in 100 80 60 50 40 30 25 20; do
        for qscale in 2 3 4 5 6 7 8 9 10; do
            if [ "$scale" -eq 100 ]; then
                ffmpeg -i "$input" -q:v "$qscale" -y "$output" -loglevel error -nostats 2>/dev/null
            else
                ffmpeg -i "$input" -vf "scale=iw*${scale}/100:-1" -q:v "$qscale" -y "$output" -loglevel error -nostats 2>/dev/null
            fi
            
            if [ ! -f "$output" ]; then
                sleep 0.1
                continue
            fi
            
            sleep 0.1
            local size=$(get_file_size "$output")
            
            if [ -z "$size" ] || [ "$size" = "0" ]; then
                continue
            fi
            
            if [ "$size" -le "$target_size" ]; then
                return 0
            fi
        done
    done
    
    return 1
}

find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while IFS= read -r img; do
    if [ ! -f "$img" ]; then
        continue
    fi
    
    echo "Processing: $img"
    
    original_size=$(get_file_size "$img")
    
    if [ -z "$original_size" ] || [ "$original_size" = "0" ]; then
        echo "  Could not read file size, skipping..."
        continue
    fi
    
    if [ "$original_size" -le "$MAX_SIZE" ]; then
        size_kb=$((original_size / 1024))
        echo "  Already under 800KB (${size_kb}KB), skipping..."
        continue
    fi
    
    orig_kb=$((original_size / 1024))
    echo "  Original size: ${orig_kb}KB"
    
    ext="${img##*.}"
    temp_file="$TEMP_DIR/$(basename "$img" | sed 's/[^a-zA-Z0-9._-]/_/g')"
    
    if [ "$ext" = "png" ] || [ "$ext" = "PNG" ]; then
        temp_output="${temp_file}.jpg"
        if compress_image "$img" "$temp_output" "$MAX_SIZE"; then
            compressed_size=$(get_file_size "$temp_output")
            if [ -n "$compressed_size" ] && [ "$compressed_size" -gt 0 ] && [ "$compressed_size" -le "$MAX_SIZE" ]; then
                new_path="${img%.*}.jpg"
                mv "$temp_output" "$new_path" 2>/dev/null
                rm -f "$img"
                comp_kb=$((compressed_size / 1024))
                echo "  ✓ Converted PNG to JPG: ${orig_kb}KB -> ${comp_kb}KB"
            else
                rm -f "$temp_output"
                echo "  ✗ Failed to compress PNG"
            fi
        else
            rm -f "$temp_output"
            echo "  ✗ Could not compress PNG below 800KB"
        fi
    else
        if compress_image "$img" "$temp_file" "$MAX_SIZE"; then
            compressed_size=$(get_file_size "$temp_file")
            if [ -n "$compressed_size" ] && [ "$compressed_size" -gt 0 ] && [ "$compressed_size" -le "$MAX_SIZE" ]; then
                mv "$temp_file" "$img" 2>/dev/null
                comp_kb=$((compressed_size / 1024))
                echo "  ✓ Compressed: ${orig_kb}KB -> ${comp_kb}KB"
            else
                rm -f "$temp_file"
                echo "  ✗ Failed to verify compression"
            fi
        else
            rm -f "$temp_file"
            echo "  ✗ Could not compress below 800KB"
        fi
    fi
done

echo ""
echo "Compression complete!"
