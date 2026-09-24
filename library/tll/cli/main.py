from __future__ import annotations

import argparse

from .. import Dictionary, LocalLanguageChatbot, Translator, get_language, list_languages, normalize_text


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="tll", description="TLL command line tools for language registry, dictionary lookup, and translation.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    languages_parser = subparsers.add_parser("languages", help="List supported languages")
    languages_parser.set_defaults(func=handle_languages)

    dictionary_parser = subparsers.add_parser("dictionary", help="Look up a word or phrase in a language dictionary")
    dictionary_parser.add_argument("language", help="Language code such as suk or sw")
    dictionary_parser.add_argument("term", help="Word or phrase to search")
    dictionary_parser.set_defaults(func=handle_dictionary)

    translate_parser = subparsers.add_parser("translate", help="Translate text using the current dictionary-first engine")
    translate_parser.add_argument("--from", dest="source", required=True, help="Source language code")
    translate_parser.add_argument("--to", dest="target", required=True, help="Target language code")
    translate_parser.add_argument("text", help="Text to translate")
    translate_parser.set_defaults(func=handle_translate)

    chat_parser = subparsers.add_parser("chat", help="Chat using the local-language dataset")
    chat_parser.add_argument("--from", dest="source", default="auto", help="Source language code")
    chat_parser.add_argument("--to", dest="target", default="sw", help="Target language code")
    chat_parser.add_argument("--llm", action="store_true", help="Use the optional local offline LLM")
    chat_parser.add_argument("--model-path", help="Path to a local GGUF model (skips downloading)")
    chat_parser.add_argument("message", help="Message to send")
    chat_parser.set_defaults(func=handle_chat)

    return parser


def handle_languages(_args: argparse.Namespace) -> int:
    for language in list_languages():
        print(f"{language.code}: {language.name} ({language.native_name or 'n/a'})")
    return 0


def handle_dictionary(args: argparse.Namespace) -> int:
    language = args.language.strip().lower()
    dictionary = Dictionary(language)
    result = dictionary.lookup(args.term)
    if result is None:
        print(f"No dictionary entry found for '{args.term}' in {language}.")
        return 0
    print(f"input: {result['input']}")
    print(f"output: {result['output']}")
    print(f"language: {result['language']}")
    print(f"dialect: {result['dialect']}")
    print(f"category: {result['category']}")
    print(f"source: {result['source']}")
    print(f"confidence: {result['confidence']}")
    return 0


def handle_translate(args: argparse.Namespace) -> int:
    normalized = normalize_text(args.text)
    translator = Translator(source=args.source, target=args.target)
    result = translator.translate(normalized)
    print(f"source_language: {result['source_language']}")
    print(f"target_language: {result['target_language']}")
    print(f"text: {result['text']}")
    print(f"output: {result['output']}")
    print(f"method: {result['method']}")
    print(f"confidence: {result['confidence']}")
    print(f"status: {result['status']}")
    if "note" in result:
        print(f"note: {result['note']}")
    return 0


def handle_chat(args: argparse.Namespace) -> int:
    chatbot = LocalLanguageChatbot(
        language="suk",
        stage="cleaned",
        backend="llm" if args.llm else "dataset",
        model_path=args.model_path,
    )
    result = chatbot.chat(
        args.message,
        source_language=args.source,
        target_language=args.target,
    )
    print(f"response: {result['response']}")
    print(f"grounded: {result['grounded']}")
    print(f"source_language: {result['language']}")
    print(f"target_language: {result['target_language']}")
    print(f"match_type: {result['translation']['match_type']}")
    print(f"confidence: {result['translation']['confidence']}")
    print(f"backend: {result['backend']}")
    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
