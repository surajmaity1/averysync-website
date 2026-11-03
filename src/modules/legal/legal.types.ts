/** Content model for the static legal pages (terms & privacy). */

export type LegalKind = 'terms' | 'privacy'

/** A paragraph of prose within a section. */
export interface LegalParagraph {
  type: 'paragraph'
  text: string
}

/** A bulleted list within a section. */
export interface LegalList {
  type: 'list'
  items: string[]
}

export type LegalBlock = LegalParagraph | LegalList

export interface LegalSection {
  /** URL-safe slug used for the anchor id and table-of-contents link. */
  id: string
  heading: string
  body: LegalBlock[]
}

export interface LegalDocument {
  kind: LegalKind
  title: string
  /** Short summary shown under the title before the table of contents. */
  intro: string
  /** ISO date (YYYY-MM-DD) the document last changed. */
  lastUpdated: string
  sections: LegalSection[]
}
