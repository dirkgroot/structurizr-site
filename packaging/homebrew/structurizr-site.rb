class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  version "0.2.0-pre-alpha.1"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.1/structurizr-site-darwin-arm64"
      sha256 "b1da51bf89a7a5aee08f41ce6fde7066942177b11b058318be6216ed998bff37"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.1/structurizr-site-darwin-x64"
      sha256 "f209e06c7d0247125f0b6c4c8443469fb2a6da38220b332c4dedd9bf8898659a"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.1/structurizr-site-linux-arm64"
      sha256 "c90eb6268601a6e04cfad5a2adc659c335d90207a8af7b82da05ae7af37cdf31"
    end

    on_intel do
      url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.2.0-pre-alpha.1/structurizr-site-linux-x64"
      sha256 "bc23edd4bd7414acd314185945512acfb6b4ca983deb1da62b99443e676e9149"
    end
  end

  def install
    bin.install Dir["structurizr-site-*"].first => "structurizr-site"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
