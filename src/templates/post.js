import React, { useMemo } from "react"
import { graphql } from "gatsby"
import {
  Paper,
  Meta,
  MetaSpan,
  MetaActions,
  DraftBadge,
} from "../components/style"
import { EditToggle } from "../components/editToggle"
import { ListAuthors } from "../components/authors"
import { Link } from "gatsby"
import { PageLayout } from "../components/pageLayout"
import { TinaField, TinaForm } from "@tinacms/form-builder"
import { Wysiwyg } from "@tinacms/fields"
import { useLocalRemarkForm, DeleteAction } from "gatsby-tinacms-remark"
import {
  InlineForm,
  InlineTextField,
  InlineWysiwyg,
} from "react-tinacms-inline"
import { useAuthors } from "../components/useAuthors"

function Post(props) {
  const authors = useAuthors()
  const page = props.data.markdownRemark
  const formOptions = {
    actions: [DeleteAction],
    fields: [
      {
        label: "Title",
        name: "rawFrontmatter.title",
        component: "text",
      },

      {
        name: "rawFrontmatter.draft",
        component: "toggle",
        label: "Draft",
      },

      {
        label: "Hero Image",
        name: "rawFrontmatter.hero.image",
        component: "image",
        parse: (filename) => `../images/${filename}`,
        uploadDir: () => `/content/images/`,
        previewSrc: (formValues) => {
          if (
            !formValues.frontmatter.hero ||
            !formValues.frontmatter.hero.image
          )
            return ""
          return formValues.frontmatter.hero.image.childImageSharp.fluid.src
        },
      },
    ],
  }

  const [data, form] = useLocalRemarkForm(page, formOptions)

  return (
    <InlineForm form={form}>
      <PageLayout page={data}>
        <Paper>
          <Meta>
            <MetaSpan>{data.frontmatter.date}</MetaSpan>
            {data.frontmatter.authors && data.frontmatter.authors.length > 0 && (
              <MetaSpan>
                <em>By</em>&nbsp;
                <ListAuthors authorIDs={data.frontmatter.authors} />
              </MetaSpan>
            )}
            <MetaActions>
              <Link to="/portfolio">← Back to my portfolio</Link>
            </MetaActions>
          </Meta>
          <h1>
            <InlineTextField name="rawFrontmatter.title" />
          </h1>
          <hr />
          <InlineWysiwyg name="rawMarkdownBody" format="markdown">
            <div
              dangerouslySetInnerHTML={{
                __html: data.html,
              }}
            />
          </InlineWysiwyg>
          {data.frontmatter.draft && <DraftBadge>Draft</DraftBadge>}
          {process.env.NODE_ENV !== "production" && <EditToggle />}
        </Paper>
      </PageLayout>
    </InlineForm>
  )
}

export default Post

export const postQuery = graphql`
  query($path: String!) {
    markdownRemark(
      published: { eq: true }
      frontmatter: { path: { eq: $path } }
    ) {
      id
      excerpt(pruneLength: 160)
      html

      frontmatter {
        path
        date(formatString: "MMMM DD, YYYY")
        title
        draft
        authors
        hero {
          large
          overlay
          image {
            childImageSharp {
              fluid(quality: 70, maxWidth: 1920) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }

      fileRelativePath
      rawFrontmatter
      rawMarkdownBody
    }
    settingsJson(fileRelativePath: { eq: "/content/settings/authors.json" }) {
      ...authors
    }
  }
`
