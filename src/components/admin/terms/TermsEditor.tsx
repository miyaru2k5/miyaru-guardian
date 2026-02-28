import React from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const TermsEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="text-xs text-muted-foreground block">
        Nội dung điều khoản (HTML hoặc text)
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={10}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[200px]"
      />
      <div className="rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Gợi ý:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Có thể dùng thẻ &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;...</li>
          <li>Không nên chèn script hoặc iframe.</li>
        </ul>
      </div>
    </div>
  );
};

export default TermsEditor;

