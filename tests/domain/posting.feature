Feature: Posting Issues
  In order to submit issues
  As a user
  I can use my editor to submit issues

  Background:
    Given the following users: adrian
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
       | project  | DEV |
       | assignee |     |
       | type     | bug |
      And I look issue number "1"
     Then the "project" should equal "DEV"
      And the "assignee" should equal ""
      And the "type" should equal "bug"
