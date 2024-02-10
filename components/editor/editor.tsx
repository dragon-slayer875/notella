"use client";
import LiveblocksProvider from "@liveblocks/yjs";
import * as Y from "yjs";
import { useRoom, useSelf } from "@/liveblocks.config";
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    EditorState,
    LexicalEditor,
} from "lexical";
import { SetStateAction, useEffect, useState } from "react";
import "./editor.css";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { notellaTheme } from "./notellaTheme";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import { Provider } from "@lexical/yjs";

interface Props {}

const markdown = `Welcome to Lexical!`;

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Focus the editor when the effect fires!
        editor.focus();
    }, [editor]);

    return null;
}

function MyOnChangePlugin(props: {
    onChange: (editorState: EditorState) => void;
}): null {
    const { onChange } = props; // Destructure the props
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            onChange(editorState);
        });
    }, [editor, onChange]);
    return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
    console.error(error);
}

const initialConfig = {
    namespace: "MyEditor",
    theme: notellaTheme,
    onError,
    nodes: [
        HeadingNode,
        QuoteNode,
        CodeNode,
        LinkNode,
        ListNode,
        ListItemNode,
        HorizontalRuleNode,
    ],
    // editorState: () => $convertFromMarkdownString(markdown, TRANSFORMERS),
    editorState: null,
};

function initialEditorState(editor: LexicalEditor): void {
    const root = $getRoot();
    const paragraph = $createParagraphNode();
    const text = $createTextNode();
    paragraph.append(text);
    root.append(paragraph);
}

export default function Editor({}: Props): JSX.Element {
    const [editorState, setEditorState] = useState();

    function onChange() {
        setEditorState(editorState);
    }

    const room = useRoom();
    const userInfo = useSelf((me) => me.info);

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
                contentEditable={
                    <ContentEditable className="contentEditable" />
                }
                placeholder={
                    <div className="placeholder">Enter some text...</div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <MyCustomAutoFocusPlugin />
            <MyOnChangePlugin onChange={onChange} />
            <CollaborationPlugin
                id="yjs-plugin"
                cursorColor={(userInfo as any).color}
                username={(userInfo as any).name}
                providerFactory={(id, yjsDocMap) => {
                    // Set up Liveblocks Yjs provider
                    const doc = new Y.Doc();
                    yjsDocMap.set(id, doc);
                    const provider = new LiveblocksProvider(
                        room,
                        doc
                    ) as Provider;
                    return provider;
                }}
                initialEditorState={initialEditorState}
                shouldBootstrap={true}
            />
        </LexicalComposer>
    );
}
