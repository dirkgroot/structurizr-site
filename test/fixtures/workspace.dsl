workspace "My Architecture" {
  model {
    user = person "User"
    system = softwareSystem "System"
    user -> system "Uses"
  }

  views {
    systemContext system {
      include *
    }
  }
}
