package benchmark;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class AccountService {
    public record Account(long id, String email, boolean verified) {}

    private AccountService() {}

    public static Map<Boolean, List<Account>> partitionByVerification(List<Account> accounts) {
        return accounts.stream()
                .filter(account -> !account.email().isBlank())
                .collect(Collectors.partitioningBy(Account::verified));
    }

    public static void main(String[] args) {
        var accounts = List.of(
                new Account(1, "ada@example.com", true),
                new Account(2, "grace@example.com", false));

        partitionByVerification(accounts)
                .forEach((verified, values) ->
                        System.out.printf("verified=%s count=%d%n", verified, values.size()));
    }
}
