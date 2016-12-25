export interface JiraIssuesResponse {
  issues: JiraIssueResponse[]
}

export interface JiraIssueResponse {
  key: string,
  fields: JiraIssueFields
}

export interface JiraIssueFields {
  summary: string,
  description: string,
  assignee: JiraField,
  reporter: JiraField,
  priority: JiraField,
  issuetype: JiraField,
  status: JiraField,
  created: string,
  updated: string,
}

export interface JiraField {
  id: string,
  name: string,
  key?: string
}

export interface JiraCommentResponse {
  body: string,
  author: JiraField,
  created: string
}

export interface JiraCommentsResponse {
  comments: JiraCommentResponse[]
}
