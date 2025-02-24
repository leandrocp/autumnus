; wrapping in (directive .. ) prevents us from highlighting '%>' in a comment as a keyword
(directive ["<%" "<%=" "<%%" "<%%=" "%>"] @keyword)

(comment) @comment
