Feature: Level 3

  Scenario: Level 3
    Given I login
    When I visit <provider> workload
    Then I see "unknown user" in the <provider> workload
    Examples:
      | provider  |
      | provider1 |