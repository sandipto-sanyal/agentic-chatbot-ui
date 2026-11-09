import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TestPage() {
    const markdown = [
        '| Name    | Role       | Department  | Status   |',
        '| ------- | ---------- | ----------- | -------- |',
        '| Alice   | Engineer   | Platform    | Active   |',
        '| Bob     | Designer   | Product     | Active   |',
        '| Carla   | Manager    | Operations  | On leave |',
        '| Dev     | Analyst    | Finance     | Active   |',
        '| Elena   | Support    | Customer    | Inactive |',
    ].join('\n')
    return (
        <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    )
}