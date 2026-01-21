#!/usr/bin/env python3
"""Quick script to update deprecated Pydantic Config to ConfigDict"""

import re

file_path = "backend/app.py"

with open(file_path, 'r') as f:
    content = f.read()

# Pattern to match the old Config class style
pattern = r'(\s+)class Config:\n\1    from_attributes = True'
replacement = r'\1model_config = ConfigDict(from_attributes=True)'

# Replace all occurrences
updated_content = re.sub(pattern, replacement, content)

# Write back
with open(file_path, 'w') as f:
    f.write(updated_content)

print("✅ Updated all Pydantic Config classes to ConfigDict")
print(f"Made {len(re.findall(pattern, content))} replacements")
