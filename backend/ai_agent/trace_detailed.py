import re

def trace_detailed(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    
    # Trace from line 1000 to 1300
    for i, line in enumerate(lines):
        line_num = i + 1
        if line_num < 1000: continue
        if line_num > 1300: break
        
        # Matches openings and closings
        matches = re.findall(r'<div|<main|<AnimatePresence|<motion\.div|{activeSection === [^ ]+ && \(|</div|</main|</AnimatePresence|</motion\.div|(\)})', line)
        # Note: the closing paren/curly brace is tricky in regex if it's not unique
        
        # Let's try a better approach: finding all tags and braces
        # We focus on < > and { }
        
        # Actually, simplifies:
        tags = re.findall(r'<(?:div|main|AnimatePresence|motion\.div)|</(?:div|main|AnimatePresence|motion\.div)>|{activeSection === [^)]+\(|\)}', line)
        
        for tag in tags:
            if tag.startswith('</'):
                tag_name = tag[2:-1]
                if not stack:
                    print(f"Error at {line_num}: Close tag {tag} with empty stack")
                    continue
                last_tag, last_line = stack.pop()
                last_name = last_tag[1:] if last_tag.startswith('<') else last_tag
                if tag_name != last_name:
                    print(f"Mismatch at {line_num}: Found {tag}, but expected closure for {last_tag} from line {last_line}")
                    # return # stop at first
            elif tag == ')}':
                if not stack:
                    print(f"Error at {line_num}: Close logic with empty stack")
                    continue
                last_tag, last_line = stack.pop()
                if not last_tag.startswith('{activeSection'):
                    print(f"Mismatch at {line_num}: Found )}, but last was {last_tag} from line {last_line}")
                    # return
            else:
                stack.append((tag, line_num))
                
    if stack:
        print(f"Still open at line 1300: {stack}")
    else:
        print("Balanced within selection.")

if __name__ == "__main__":
    trace_detailed(r"C:\Users\rajub\Downloads\fbnXai-main\fbnXai-main\src\Components\AdminDashboard\AdminDashboard.jsx")
