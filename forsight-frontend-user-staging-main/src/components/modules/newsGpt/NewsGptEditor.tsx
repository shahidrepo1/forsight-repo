import { Editor } from "@tinymce/tinymce-react";

export default function NewsGptEditor({
  data,
  setData,
  // isUrdu,
}: {
  data: string;
  setData: React.Dispatch<React.SetStateAction<string>>;
  isUrdu: boolean;
}) {
  return (
    <Editor
      apiKey="pxj7szhfd8abhc5tqouadeglnjme9iar24l2j2roe5hylycr"
      value={data}
      onEditorChange={(newContent: string) => {
        setData(newContent);
      }}
      init={{
        selector: "textarea#open-source-plugins",
        // directionality: isUrdu ? "rtl" : "ltr",
        height: 600,
        max_height: 1000,
        plugins:
          "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion",
        editimage_cors_hosts: ["picsum.photos"],
        menubar: "file edit view insert format tools table help",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview print |",
        autosave_ask_before_unload: true,
        autosave_interval: "30s",
        autosave_prefix: "{path}{query}-{id}-",
        autosave_restore_when_empty: false,
        autosave_retention: "2m",
        image_advtab: true,
        importcss_append: true,
        image_caption: true,
        quickbars_selection_toolbar:
          "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
        noneditable_class: "mceNonEditable",
        toolbar_mode: "sliding",
        contextmenu: "link image table",
        branding: false,
        content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
            body {
              font-family: "Noto Nastaliq Urdu", serif;
              font-size:16px;
              line-height: 2.5;
              letter-spacing: 1px;
            }
          `,
      }}
    />
  );
}
