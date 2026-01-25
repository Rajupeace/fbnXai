import sys

def count_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    open_divs = content.count('<div')
    close_divs = content.count('</div')
    open_motion = content.count('<motion.div')
    close_motion = content.count('</motion.div')
    open_paren = content.count('&& (')
    close_paren = content.count(')}' or ' )}') # simplified
    
    print(f"Open <div: {open_divs}")
    print(f"Close </div: {close_divs}")
    print(f"Open <motion.div: {open_motion}")
    print(f"Close </motion.div: {close_motion}")

if __name__ == "__main__":
    count_tags(r"C:\Users\rajub\Downloads\fbnXai-main\fbnXai-main\src\Components\AdminDashboard\AdminDashboard.jsx")
