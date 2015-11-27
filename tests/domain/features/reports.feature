Feature: Reports
  In order to quickly apply or jump between multiple filters
  As a developer
  I can save my searches for quick recollection

  Background:
    Given the following issues:
      | id  | title           | description        | status      | assignee | type    |
      | 1   | Can't post      | I get an error     | To Do       | adrian   | bug     |
      | 2   | Crashes on open | TypeError          | In Progress |          | bug     |
      | 3   | Windows support | Windows 3 support? | Closed      | adrian   | request |

     And I have the following reports:
      | name | type     | value       |
      | todo | status   | To Do       |
      | mine | assignee | adrian      |
      | open | status   | To Do       |
      | open | status   | In Progress |

  Scenario: Default report (no filters)
     When I query issues
     Then I should get issues [1, 2, 3] back

  Scenario: Filter by report
    Given I activate the "todo" report
     When I query issues
     Then I should get issues [1] back

  Scenario: Save report
    Given I filter "assignee" by "joey"
      And I save the report as "joeys stuff"
     Then "joeys stuff" should be in my list of reports

  Scenario: Modifying an existing report doesn't change it
    Given I activate the "todo" report
      And I filter "status" by "In Progress"
     When I activate the "todo" report
      And I query issues
     Then I should get issues [1] back
      And I should not get issues [2] back
