import typer
import os
import json
import re
import uuid
import shlex
from pathlib import Path
import logging
from dataclasses import dataclass

app = typer.Typer()
class RedErrorFormatter(logging.Formatter):
    RED = "[91m"
    RESET = "[0m"

    def format(self, record):
        message = super().format(record)
        if record.levelno >= logging.ERROR:
            return f"{self.RED}{message}{self.RESET}"
        return message

handler = logging.StreamHandler()
handler.setFormatter(RedErrorFormatter("%(message)s"))
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger(__name__)

@dataclass
class ParseContext:
    lines: list[str]
    idx: int
    level: dict
    cmd: str = None
    args: list[str] = None

def clean_arg(s):
    return s.strip("\"")

def parse_directive(line):
    line = line.strip()
    if not line.startswith("##"):
        raise ValueError(f"Invalid directive format: {line}")
    try:
        # Split into directive and rest
        prefix, *rest = line.split(maxsplit=1)
        cmd = prefix[2:]
        arg_string = rest[0] if rest else ""
        args = shlex.split(arg_string)
        return cmd, args
    except Exception as e:
        raise ValueError(f"Failed to parse directive: {line}\n{e}")

def collect_block_until(lines, idx, end_directive):
    block = ""
    while idx < len(lines) and not lines[idx].strip().startswith(f"##{end_directive}"):
        line = lines[idx].rstrip("\n")
        if line.startswith('##'):
            raise ValueError(f"Missing ##{end_directive} directive? Or what?!")
        block += line + "\n"
        idx += 1
    if idx >= len(lines):
        raise ValueError(f"Missing ##{end_directive} directive")
    return block, idx

def read_filename(context):
    if len(context.args) != 1:
        raise ValueError("##filename must have exactly one argument")
    context.level["filename"] = context.args[0]
    context.idx += 1

def read_wisdoms(context):
    context.level["wisdoms"] = context.args
    context.idx += 1

def read_text_block(context):
    text_block = []
    while context.idx < len(context.lines) and not context.lines[context.idx].startswith("##"):
        text_block.append(context.lines[context.idx].rstrip("\n"))
        context.idx += 1
    if text_block:
        context.level["blocks"].append({"type": "text", "text": "\n".join(text_block) + "\n"})

def read_replace_span(context):
    if len(context.args) != 3:
        raise ValueError("##replace-span requires 3 arguments: event, clickable, replacement")
    event = context.args[0] if context.args[0] != "-" else str(uuid.uuid4())
    block = {
        "type": "replace-span",
        "clickable": clean_arg(context.args[1]),
        "replacement": clean_arg(context.args[2]),
        "event": event
    }
    context.level["blocks"].append(block)
    context.idx += 1

def read_replace(context):
    if len(context.args) > 2:
        raise ValueError("##replace requires zero, one or two arguments: event and clickable")
    event = context.args[0] if context.args and context.args[0] != "-" else str(uuid.uuid4())
    clickable = context.args[1] if len(context.args) > 1 else None
    context.idx += 1
    text, context.idx = collect_block_until(context.lines, context.idx, "with")
    context.idx += 1
    replacement, context.idx = collect_block_until(context.lines, context.idx, "end")
    context.idx += 1
    block = {
        "type": "replace",
        "text": text,
        "replacement": replacement,
        "event": event
    }
    if clickable:
        block["clickable"] = clean_arg(clickable)
    context.level["blocks"].append(block)

def read_replace_on(context):
    if len(context.args) != 1:
        raise ValueError("##replace-on requires exactly one argument: event")
    event = context.args[0]
    context.idx += 1
    text, context.idx = collect_block_until(context.lines, context.idx, "with")
    context.idx += 1
    replacement, context.idx = collect_block_until(context.lines, context.idx, "end")
    context.idx += 1
    block = {
        "type": "replace-on",
        "text": text,
        "replacement": replacement,
        "event": event
    }
    context.level["blocks"].append(block)

def read_add_on(context):
    if len(context.args) != 1:
        raise ValueError("##add-on requires exactly one argument: event")
    event = context.args[0]
    context.idx += 1
    lines, context.idx = collect_block_until(context.lines, context.idx, "end")
    context.idx += 1
    block = {
        "type": "replace-on",
        "event": event,
        "text": "",
        "replacement": lines,
    }
    context.level["blocks"].append(block)

def read_remove_on(context):
    if len(context.args) != 1:
        raise ValueError("##remove-on requires exactly one argument: event")
    event = context.args[0]
    context.idx += 1
    lines, context.idx = collect_block_until(context.lines, context.idx, "end")
    context.idx += 1
    block = {
        "type": "replace-on",
        "event": event,
        "text": lines,
        "replacement": ""
    }
    context.level["blocks"].append(block)

def read_neutral(context):
    if len(context.args) != 1:
        raise ValueError("##neutral requires exactly one argument: clickable")
    block = {
        "type": "neutral",
        "clickable": clean_arg(context.args[0])
    }
    context.level["blocks"].append(block)
    context.idx += 1

def read_explain(context):
    if len(context.args) != 1:
        raise ValueError("##explain requires exactly one argument: explanation")
    if not context.level["blocks"]:
        raise ValueError("##explain must follow a block")
    prev_block = context.level["blocks"][-1]
    if prev_block["type"] not in {"replace", "replace-span", "neutral"}:
        raise ValueError(f"##explain cannot follow block of type: {prev_block['type']}")
    value = clean_arg(" ".join(context.args))
    prev_block["explanation"] = value
    context.idx += 1

def read_hint(context):
    if len(context.args) != 1:
        raise ValueError("##hint requires exactly one argument: hint")
    if not context.level["blocks"]:
        raise ValueError("##hint must follow a block")
    prev_block = context.level["blocks"][-1]
    if prev_block["type"] not in {"replace", "replace-span"}:
        raise ValueError(f"##hint cannot follow block of type: {prev_block['type']}")
    value = clean_arg(" ".join(context.args))
    prev_block["hint"] = value
    context.idx += 1

def read_level(context):
    if len(context.args) != 1:
        raise ValueError("##level must have exactly one argument")
    context.level["filename"] = context.args[0]
    context.idx += 1

    # Check if we have more lines and the next line contains triple quotes
    if context.idx < len(context.lines):
        current_line = context.lines[context.idx].strip()

        # Handle the case where triple quotes are on their own line
        if current_line == '"""':
            context.idx += 1  # Skip the opening triple quote line
            instructions = []

            # Collect lines until we find the closing triple quote
            while context.idx < len(context.lines) and not context.lines[context.idx].strip().endswith('"""'):
                instructions.append(context.lines[context.idx].rstrip("\n"))
                context.idx += 1

            # Include the last line without the closing triple quotes if needed
            if context.idx < len(context.lines):
                last_line = context.lines[context.idx].rstrip("\n")
                if last_line.strip() != '"""':  # If it's not just quotes, include the content
                    instructions.append(last_line.rstrip('"""').rstrip())
                context.idx += 1

            context.level["instructions"] = "\n".join(instructions)

        # Handle the case where the line starts with triple quotes (possibly with content)
        elif current_line.startswith('"""'):
            # If the line both starts and ends with triple quotes, it's a single-line instruction
            if current_line.endswith('"""') and len(current_line) > 6:  # More than just opening and closing quotes
                # Extract content between triple quotes
                instructions = current_line[3:-3]
                context.idx += 1
                context.level["instructions"] = instructions
            else:
                # Multi-line instruction starting on this line
                instructions = [current_line[3:]]  # Skip opening quotes
                context.idx += 1

                # Collect lines until we find the closing triple quote
                while context.idx < len(context.lines) and not context.lines[context.idx].strip().endswith('"""'):
                    instructions.append(context.lines[context.idx].rstrip("\n"))
                    context.idx += 1

                # Include the last line without the closing triple quotes
                if context.idx < len(context.lines):
                    last_line = context.lines[context.idx].rstrip("\n")
                    if last_line.endswith('"""'):
                        # Remove closing quotes
                        instructions.append(last_line[:-3])
                    context.idx += 1

                context.level["instructions"] = "\n".join(instructions)

def parse_level_file(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    level = {
        "filename": None,
        "wisdoms": [],
        "blocks": [],
    }
    context = ParseContext(lines=lines, idx=0, level=level)

    while context.idx < len(lines):
        try:
            if context.lines[context.idx].startswith("##"):
                line = context.lines[context.idx]
                context.cmd, context.args = parse_directive(line)

                match context.cmd:
                    case "filename": read_filename(context)
                    case "level": read_level(context)
                    case "wisdoms": read_wisdoms(context)
                    case "replace-span": read_replace_span(context)
                    case "replace": read_replace(context)
                    case "replace-on": read_replace_on(context)
                    case "add-on": read_add_on(context)
                    case "remove-on": read_remove_on(context)
                    case "neutral": read_neutral(context)
                    case "explain": read_explain(context)
                    case "hint": read_hint(context)
                    case _: raise ValueError(f"Unknown directive: ##{context.cmd}")
            else:
                read_text_block(context)
        except Exception as e:
            logger.error(f"{str(e)}. Line {context.idx+1} in {path}")
            return
    return level

@app.command()
def build(source: str = "levels", output: str = "web/src/data/levels.json"):
    """
    Convert PyLevel .py files into levels.json
    """
    output_structure = {"topics": []}

    for topic_dir in sorted(Path(source).iterdir()):
        if not topic_dir.is_dir():
            continue
        topic_file = topic_dir / "topic.json"
        if not topic_file.exists():
            continue

        with open(topic_file, "r", encoding="utf-8") as f:
            topic_data = json.load(f)

        topicName = topic_data["name"]

        logger.info(f"{topicName} ({topic_file})")

        topic = {
            "name": topicName,
            "wisdoms": topic_data.get("wisdoms", []),
            "levels": [],
        }

        for level_file in sorted(topic_dir.glob("*.py")):
            logger.info(f"  * level {level_file}")
            topic["levels"].append(parse_level_file(level_file))

        output_structure["topics"].append(topic)

    os.makedirs(Path(output).parent, exist_ok=True)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(output_structure, f, indent=2, ensure_ascii=False)

    logger.info(f"✅ Built {output} from {source}")

if __name__ == "__main__":
    app()
