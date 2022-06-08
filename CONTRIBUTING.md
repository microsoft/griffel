# Contributing to Griffel

Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Prerequisites

Make sure you have at least Node.js v14:

```sh
node -v

v14.0.0
```

We use `yarn` and advise you to do so while contributing. Get it [here](https://yarnpkg.com/).

### Fork, Clone & Install

Start by [forking Griffel](https://github.com/microsoft/griffel) to your GitHub account. Then clone your fork and install dependencies:

```sh
git clone git@github.com:<your-user>/griffel.git
cd griffel
yarn
```

Add our repo as a git remote so you can pull/rebase your fork with our latest updates:

```
git remote add upstream git@github.com:microsoft/griffel.git
```

### Submitting changes

Pull requests are the greatest contributions, so be sure they are focused in scope and avoid unrelated commits.

1. Create a branch for your feature or fix:

   ```bash
   # Move into a new branch for your feature
   git checkout -b fix/bug
   ```

2. If your code passes all the tests, then push your feature branch:

   ```bash
   # Test current code
   yarn test

   # Build current code
   yarn build
   ```

3. Create a changelog entry

   We use [beachball](https://github.com/microsoft/beachball) to generate changelogs.

   ```bash
   # Create new entries
   yarn change
   ```

   > Note: A change file tells beachball how to increment each package's semantic version (semver) upon publish. The message in the change file will be included in the package release notes, so make it brief but informative.

4. Push the branch for your new feature

   ```bash
   git push origin fix/bug
   ```

Now [open a pull request](https://help.github.com/articles/using-pull-requests/) with a clear title and description.
