import re

def trace_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    
    # We trace from line 1000 onwards
    for i, line in enumerate(lines):
        line_num = i + 1
        if line_num < 1000: continue
        if line_num > 1300: break
        
        # This is a bit naive but good for finding the first error
        matches = re.findall(r'<div|</div|<motion\.div|</motion\.div|{activeSection === [^ ]+ && \(|\)}', line)
        for tag in matches:
            if tag.startswith('</') or tag == ')}':
                if not stack:
                    print(f"Error at line {line_num}: Found closing tag {tag} with empty stack")
                    continue
                last_tag, last_line = stack.pop()
                if (tag == '</div' and last_tag != '<div') or \
                   (tag == ')}' and not last_tag.startswith('{activeSection')):
                    print(f"Mismatch at line {line_num}: Found {tag}, but opened with {last_tag} at line {last_line}")
                    # Put it back to continue tracing
                    # stack.append((last_tag, last_line)) 
            else:
                stack.append((tag, line_num))
                
    if stack:
        print(f"Still open: {stack}")

if __name__ == "__main__":
    trace_tags(r"C:\Users\rajub\Downloads\fbnXai-main\fbnXai-main\src\Components\AdminDashboard\AdminDashboard.jsx")
