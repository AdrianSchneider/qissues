Feature: Posting Issues
  In order to submit issues
  As a developer
  I can use my editor to submit issues

  Background:
    Given no issues
      And the following users: adrian
      And the following types: bug, improvement
      And the following projects: DEV

  Scenario: Posting an issue
     When I go to create an issue
     Then I should get prompted for:
       | field       | required | options          |
       | title       | yes      |                  |
       | description | no       |                  |
       | project     | yes      | DEV              |
       | assignee    | no       | adrian           |
       | type        | yes      | bug, improvement |
     When I submit the following issue:
       | title    | Hello World |
       | project  | DEV         |
       | type     | bug         |
     Then the issue should be persisted
     Then the "project" should equal "DEV"
      And the "assignee" should equal ""
      And the "type" should equal "bug"

  Scenario: Posting an issue without required fields
     When I go to create an issue
     Then I should get prompted for:
       | field       | required | options          |
       | title       | yes      |                  |
       | description | no       |                  |
       | project     | yes      | DEV              |
       | assignee    | no       | adrian           |
       | type        | yes      | bug, improvement |
     When I submit the following issue:
       | type     | bug |
     Then the issue should fail to post
      And I should get prompted for:
       | field       | required | options          |
       | title       | yes      |                  |
       | description | no       |                  |
       | project     | yes      | DEV              |
       | assignee    | no       | adrian           |
       | type        | yes      | bug, improvement |
