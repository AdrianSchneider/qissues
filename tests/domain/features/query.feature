Feature: Query Issues
  In order to find relevant issues
  As a developer
  I can apply filters to narrow down the issue list

  Background:
    Given the following issues:
      | id  | title           | description        | status      | assignee | type    |
      | 1   | Can't post      | I get an error     | To Do       | adrian   | bug     |
      | 2   | Crashes on open | TypeError          | In Progress |          | bug     |
      | 3   | Windows support | Windows 3 support? | Closed      | adrian   | request |

  Scenario: Default list
     When I query issues
     Then I should get issues [1, 2, 3] back

  Scenario: Filter by assignee
    Given I filter "assignee" by "adrian"
     When I query issues
     Then I should get issues [1,3] back

  Scenario: Filter by status
    Given I filter "status" by "To Do"
     When I query issues
     Then I should get issues [1] back

  Scenario: Filter by multiple fields - logical AND
    Given I filter "assignee" by "adrian"
      And I filter "type" by "bug"
     When I query issues
     Then I should get issues [1] back

  Scenario: Filter by multiple values - logical OR
    Given I filter "type" by "bug"
      And I filter "type" by "request"
     When I query issues
     Then I should get issues [1,2,3] back
