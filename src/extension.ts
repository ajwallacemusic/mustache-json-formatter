import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.languages.registerDocumentFormattingEditProvider('mustache_json', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const textEdits: vscode.TextEdit[] = [];
            const text = document.getText();
            const formattedText = formatJsonMustache(text);
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );

            textEdits.push(vscode.TextEdit.replace(fullRange, formattedText));
            return textEdits;
        }
    });

    context.subscriptions.push(disposable);
}

function formatJsonMustache(text: string): string {
    let indentLevel = 0;
    const indentSize = 2;
    const lines = text.split('\n');
    const formattedLines = lines.map((line) => {
        let trimmedLine = line.trim();

        // Decrease indent on closing mustache sections
        if (trimmedLine.startsWith('{{/')) {
            indentLevel = Math.max(indentLevel - 1, 0);
        }

        // Decrease indent for closing braces
        if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']')) {
            indentLevel = Math.max(indentLevel - 1, 0);
        }

        const currentIndent = ' '.repeat(indentLevel * indentSize);
        let formattedLine = `${currentIndent}${trimmedLine}`;

        // Increase indent after opening mustache sections
        if (trimmedLine.startsWith('{{#') || trimmedLine.startsWith('{{^')) {
            indentLevel += 1;
        }

        // Increase indent after opening braces
        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[')) {
            indentLevel += 1;
        }

        return formattedLine;
    });

    return formattedLines.join('\n');
}

export function deactivate() {}