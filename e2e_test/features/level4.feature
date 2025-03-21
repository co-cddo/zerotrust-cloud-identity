Feature: Level 4

  Scenario: Level 4
    Given I login
    When I visit <provider> workload "/objectstore"
    Then I see "unknown user" in the <provider> workload
    Examples:
      | provider  |
      | provider1 |