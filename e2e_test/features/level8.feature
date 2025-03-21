Feature: Level 8

  Scenario: Level 8
    Given I login
    When I visit <provider> workload "/provider2/objectstore"
    Then I see "unknown user" in the <provider> workload
    Examples:
      | provider  |
      | provider1 |