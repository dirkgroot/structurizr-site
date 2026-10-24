workspace "ACME Corporation" "The software architecture of ACME Corporation." {

    model {
        user = person "User"
        core = softwareSystem "ACME Core" "The core platform."
        billing = softwareSystem "ACME Billing" "Invoices and payments."
        user -> core "Uses"
        core -> billing "Sends invoices to"
    }

    views {
        systemContext core "CoreContext" {
            include *
            autolayout lr
        }
    }
}
