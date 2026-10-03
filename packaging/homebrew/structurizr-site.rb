class StructurizrSite < Formula
  desc "Static site generator for Structurizr workspaces"
  homepage "https://github.com/dirkgroot/structurizr-site"
  url "https://github.com/dirkgroot/structurizr-site/releases/download/v0.1.0/structurizr-site-0.1.0.tgz"
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"
  license "MIT"

  depends_on "node"

  # Java, the Structurizr backend, and PlantUML become dependencies once the
  # generator invokes Structurizr and renders diagrams. See
  # lode/architecture/distribution.md.

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/structurizr-site --version")
  end
end
