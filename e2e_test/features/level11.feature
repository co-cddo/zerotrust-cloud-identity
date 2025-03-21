Feature: Level 11

  Scenario: Level 11
    Given I login
    When I visit <provider> workload "/provider2/workload"
    Then I see "unknown user" in the <provider> workload
    Examples:
      | provider  |
      | provider1 |