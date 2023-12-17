#set text(
  lang: "zh",
  font: (
    "Noto Sans",
    "Noto Sans SC",
    "Noto Sans Arabic",
    "Noto Sans Hebrew",
    "Noto Sans Devanagari,
  ),
)

#show link: underline

#show raw.where(block: true): block.with(
  fill: luma(240),
  inset: 10pt,
  radius: 4pt,
)

#show quote.where(block: true): block.with(
  fill: rgb("#f1f6f9"),
  inset: 10pt,
  radius: 4pt,
)

#set page(
  header: locate(loc => {
    if counter(page).at(loc).first() > 1 [
      MDBOOK_TYPST_PDF_TITLE
    ]
  }),
  footer: locate(loc => {
    if counter(page).at(loc).first() > 1 [
      #counter(page).display(
        "1/1",
        both: true,
      )
    ]
  }),
)

#align(center, text(17pt)[
  *MDBOOK_TYPST_PDF_TITLE*
])

#pagebreak()
#outline(depth: 2, indent: 1em)
#pagebreak()

/**** MDBOOK_TYPST_PDF_PLACEHOLDER ****/
