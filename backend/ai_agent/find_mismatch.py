import re

def find_mismatch(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        line_num = i + 1
        if line_num < 1005: continue
        
        # We only care about tags and section markers
        # Sections start with {activeSection === ... && (
        # Sections end with )} at start of line
        
        # Find all <div and </div
        # Also find {activeSection
        # Also find )} if it's the only thing on the line or after spaces
        
        div_opens = line.count('<div')
        div_closes = line.count('</div')
        
        for _ in range(div_opens):
            stack.append(('<div', line_num))
        for _ in range(div_closes):
            if not stack: continue
            last_tag, last_line = stack.pop()
            if last_tag != '<div':
                print(f"Error at {line_num}: </div closes {last_tag} from {last_line}")
        
        if '&& (' in line and '{activeSection' in line:
            stack.append(('{activeSection', line_num))
        
        if line.strip() == ')}' or line.strip() == ')}':
             if not stack: continue
             last_tag, last_line = stack.pop()
             if last_tag != '{activeSection':
                 print(f"Error at {line_num}: )} closes {last_tag} from {last_line}")
                 return

    if stack:
        print(f"Still open: {stack}")
    else:
        print("Sequence balanced.")

if __name__ == "__main__":
    find_mismatch(r"C:\Users\rajub\Downloads\fbnXai-main\fbnXai-main\src\Components\AdminDashboard\AdminDashboard.jsx")
