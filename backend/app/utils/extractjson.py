def strip_json_markdown_block(text: str) -> str:
    lines = text.strip().splitlines()

    # 移除前面的 ```json 或 ```JSON
    if lines and lines[0].strip().lower() == "```json":
        lines = lines[1:]

    # 移除最後的 ```
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]

    return "\n".join(lines).strip()
