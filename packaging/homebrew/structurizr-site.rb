class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.2.0-pre-alpha.2"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.2/structurizr-site-darwin-arm64"
      sha256 "147a28ac4af8c23eb9b79e1a966c6ceaab23965e763664525758a0435cd1b332"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.2/structurizr-site-darwin-x64"
      sha256 "ac4506b843f86fee84f7c12b52a36a2b4e4b84c3061b30fa43515b6996f205a3"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.2/structurizr-site-linux-arm64"
      sha256 "3218e4b337fb72cbc8266c93d655c12bf8707126e1ca781bc7d70a8ac5a31373"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.2/structurizr-site-linux-x64"
      sha256 "088c59091284c438d875ad60e872a106b01833f2babfbe09aa457198493a66a3"
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
