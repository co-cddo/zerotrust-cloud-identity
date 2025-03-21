Feature: Level 9

  Scenario: Level 9
    Given I login
    When I visit <provider> workload "/provider2/objectstore"
    Then I see "unknown user" in the <provider> workload
    Examples:
      | provider  |
      | provider1 |