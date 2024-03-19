[![New Relic One Catalog Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/New_Relic_One_Catalog_Project.png)](https://opensource.newrelic.com/oss-category/#new-relic-one-catalog-project)

# User Flows (nr-user-flows)

![CI](https://github.com/newrelic/nr-user-flows/workflows/CI/badge.svg) ![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr-user-flows?include_prereleases&sort=semver) 
<a href="https://github.com/newrelic?q=nrlabs-viz&amp;type=all&amp;language=&amp;sort="><img src="https://user-images.githubusercontent.com/1786630/214122263-7a5795f6-f4e3-4aa0-b3f5-2f27aff16098.png" height=50 /></a>

This application is maintained by the New Relic Labs team. Connect with us directly by [creating issues](../../issues) or [starting a discussion](../../discussions) in this repo.

## Feature

A user flow is a path an end user or customer navigates through a particular website, to perform an intended action or finish his task using our features or products. This flow consists of the actual web pages the user has traversed through for various purposes.

Understanding the flows and experience of the user is highly important for meaningful interactions, business outcomes and revenue growth. A few benefits of analyzing user flows are as follows:
* Understanding your actual user personas
    * With the help of every action and page the end user visits on your website, it helps you to understand who your customers are, how they benefit from your products and services and also what they want.
    * This enables product and engineering teams to spend their money and energy on the right set of features.
* Improve user adoption
    * For any enterprise product, user adoption and experience is of utmost importance as it implies better user experience and stickiness with your product.

Customers often spend a good amount of money and time in defining the most important user flows, which are often based on the understanding of the business segment, product knowledge and personas.

While there are products in the market that focus on providing this information, these often involve additional implementation steps, analytical capabilities, and adding too many tools for the team to manage. 

Also, these tools do not provide performance insights, which the DevOps teams can leverage and act upon where and why there has been an issue in a user flow.

New Relic’s User Flows is an app that brings the details of User flows and performance impacts in one screen, with a couple of clicks. 

* **One click Simple Set-up**
    * The User Flows are derived by culminating existing browser interaction performance data captured by our browser agent.
    * No dependency on engineers to determine customer flows and their acceptable performance limits.
    * Savings in time and manpower.
* **Business Value**
    * Capture end user flows’ based on real user site interactions (via browser agent).
    * Provides funnel conversion of these flows’ with one click.
    * Shows how end users drop off through each stage.
    * Capture the step by step performance of real users.
    * Better adoption of your product with increased user experience and loyalty.


## Usage

New Relic’s User Flows nerd pack / custom app can be accessed from our unified catalog of integrations, dashboards, alerts, Nerdpacks, and more. 

Read our [documentation](https://developer.newrelic.com/build-apps/permission-manage-apps/) to learn about Nerdpack permissions, if you have trouble accessing the app.

In [New Relic UI](https://one.newrelic.com/), 
1. click on Apps on the Left navigation (first column)
2. Search for ***User Flows*** app
3. Click on the app tile. 

The app would the home page of the application, which consists of three drop menus.
1. **Account** drop down menu  - This displays all the accounts you have access to, as a user.
2. **Entity list** drop down menu - This displays all the browser entities monitored in the account selected.
3. **Time range** drop down menu - The time duration for which the user flows needs to be displayed.

![userflows homepage](catalog/screenshots/userflows_02_homepage.png)

Select an account, a browser entity and a time range.

The app would then 
* display the top 5 landing pages of the users for this browser entity. 
* From each landing page, user flows are automatically derived and visualized as Flow diagrams.
* The app avoids cyclic paths at multiple levels.
* The app also provides additional information regarding unique Browser Interactions and Browser Sessions.

![User flows](catalog/screenshots/userflows_03_userflow_withdetails.png)

Each flow map provides below information
* Browser Interaction Names / Page views through which the users have navigated through your website.
* \# of page views on the landing page (This does not represent unique users, as user names are not captured by the browser agent).
* Provides the number of visitors (page views) across each path.
* On the top right corner of each flow map, the average end to end duration from all paths is calculated. For e.g., in the above image, there are 2 possible paths. The average displayed is the average of both the paths.
* The domain name is displayed only on the first landing page.
* Click on the title of the Browser Interaction card to rearrange each of the browser page view cards.
* Click on the body of the Browser Interaction card to view the performance page.

Click on the ***click here*** link to view all the individual journey details, a pop up window will appear, which displays all the Flows the end users have taken.

Each record provides the actual Flow path taken by a user.
![Individual User flows](catalog/screenshots/userflows_04_flowspopup.png)

Click on each Open Query Builder, which provides the NRQL to
1. E2E Duration Query - calculates the overall end to end flow duration. 
2. Stepwise Query - timeseries based line graph to quickly identify which step takes longer duration. This is very useful to quickly identify and troubleshoot the step, where there could be performance issues. ![Userflow stepwise analysis](catalog/screenshots/userflows_06_stepwise.png)
3. Funnel Query - Funnel analysis (conversion rates) for each user flow. ![User flow funnel analysis](catalog/screenshots/userflows_07_funnelanalysis.png)

You can create an alert or add this widget to a dashboard, which can help DevOps, SRE and Business owners.


Click on the body of the Browser Interaction card to view the browser interaction performance pageview to investigate any performance related issues, hindering the User Experience.

![Browser Interaction performance pageview](catalog/screenshots/userflows_08_pageview.png)


### Contributing and improving
We are open to all suggestions that will help to improve the analysis, suggestions, services and any other capability you can think off. Please raise an issue with as much detail as possible.

## Open Source License

This project is distributed under the [Apache 2 license](blob/main/LICENSE).

## Dependencies




## Getting started

First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

```bash
git --version
npm -v
```

Next, install the [NR1 CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to [this link](https://one.newrelic.com/launcher/developer-center.launcher) and following the instructions (5 minutes or less) to install and setup your New Relic development environment.

Next, to clone this repository and run the code locally against your New Relic data, execute the following commands:

```bash
nr1 nerdpack:clone -r https://github.com/newrelic/nr-user-flows.git
cd nr-user-flows
nr1 nerdpack:serve
```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# To create a new uuid for the nerdpack so that you can deploy it to your account:
# nr1 nerdpack:uuid -g [--profile=your_profile_name]

# To see a list of API keys / profiles available in your development environment:
# nr1 profiles:list

nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Community Support

New Relic hosts and moderates an online forum where you can interact with New Relic employees as well as other customers to get help and share best practices. Like all New Relic open source community projects, there's a related topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

[https://discuss.newrelic.com/t/user-flowsr-nerdpack/82936](https://discuss.newrelic.com/t/user-flowsr-nerdpack/82936)

Please do not report issues with User Flows to New Relic Global Technical Support. Instead, visit the [`Explorers Hub`](https://discuss.newrelic.com/c/build-on-new-relic) for troubleshooting and best-practices.

## Issues / Enhancement Requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](https://github.com/newrelic/nr-user-flows/issues). Please search for and review the existing open issues before submitting a new issue.

## Security

As noted in our [security policy](https://github.com/newrelic/nr-user-flows/security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.
If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](./CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.