# AutoModerator Rule Generator

A visual, user-friendly tool to create Reddit AutoModerator rules without writing YAML code manually.

![AutoMod Generator](https://img.shields.io/badge/Reddit-AutoModerator-FF4500?style=flat&logo=reddit)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Live Demo

**[Try it now!](https://aryan-raj-7167.github.io/automod-generator)**

## Features

### Core Functionality
- **Visual Rule Builder** - No YAML knowledge required
- **Multiple Rule Support** - Create and manage multiple rules with tabs
- **Real-time YAML Preview** - See generated code as you build
- **One-Click Copy** - Copy generated YAML code instantly
- **Beginner Tips** - Collapsible quick start guide for new users

### Rule Configuration
- **Standard Conditions** - Pre-made lists for common filtering needs:
  - Image hosting sites (Imgur, etc.)
  - Direct image links (.jpg, .png)
  - Video hosting sites (YouTube, etc.)
  - Streaming sites (Twitch, etc.)
  - Crowdfunding sites (GoFundMe, etc.)
  - Meme generator sites
  - Facebook links
  - Amazon affiliate links
- **Rule Types** - Any, submission, comment, text submission, link submission, crosspost submission, poll submission, gallery submission
- **Priority Settings** - Control rule execution order with numeric priority
- **Moderator Exemption** - Toggle whether moderators bypass the rule
- **Ignore Blockquotes** - Option to skip text in quoted sections

### Search Checks
- **Multiple Fields** - Select one or more fields to check:
  - Title, body, domain, URL
  - Flair text, flair CSS class, flair template ID
  - Post/comment ID
  - Media title, media description, media author, media author URL
- **Match Types**:
  - Includes Word - Matches whole words only
  - Includes - Matches anywhere (even partial)
  - Full Exact - Must match completely
  - Full Text - Ignores spacing/punctuation
  - Starts With - Must begin with text
  - Ends With - Must end with text
  - Regular Expression - Advanced patterns
- **Case Sensitivity** - Optional case-sensitive matching
- **Reverse Matching (NOT)** - Match when text is NOT found
- **Multiple Values** - Check multiple keywords at once (comma-separated)
- **Regex Help Panel** - Built-in regex quick reference guide

### Author Conditions
- **Karma Thresholds**:
  - Comment karma
  - Post karma
  - Combined karma
- **Account Age** - Filter by account age with units:
  - Minutes, hours, days, weeks, months, years
- **Boolean Status Checks**:
  - Has verified email
  - Has Reddit Gold/Premium
  - Is approved contributor
  - Is moderator
- **Flexible Operators** - Greater than or less than comparisons

### Actions
- **Moderation Actions**:
  - Remove - Delete the post/comment
  - Spam - Mark as spam and remove
  - Filter - Send to modqueue for review
  - Approve - Allow it through
  - Report - Create a report for mods
- **Action Reasons** - Add reasons visible in mod log with `{{match}}` placeholder support

### Auto-Responses
- **Auto Comments** - Post automated comments on matched items
  - Pin/sticky comments option
  - Lock comments from replies
  - Multi-line text support
- **Modmail Notifications** - Alert moderators with custom messages
  - Custom modmail subjects
  - Multi-line text support
- **User Messages** - Send direct messages to authors
  - Custom message subjects
  - Multi-line text support
- **Available Placeholders**:
  - `{{author}}`, `{{title}}`, `{{body}}`
  - `{{domain}}`, `{{url}}`, `{{permalink}}`
  - `{{subreddit}}`, `{{match}}`

### User Interface
- **Clean Design** - Modern, gradient-based interface with Font Awesome icons
- **Responsive Layout** - Works on desktop and mobile
- **Color-Coded Sections** - Visual organization by feature type
- **Helpful Instructions** - Built-in guidance, examples, and tooltips
- **Empty State Messages** - Clear prompts when sections are empty
- **Collapsible Tips Panel** - Show/hide beginner guidance

## Use Cases

Perfect for Reddit moderators who want to:
- Filter spam and low-quality posts
- Set up karma/age requirements for new users
- Auto-respond to rule violations
- Create complex moderation workflows
- Enforce content guidelines automatically
- Block specific domains or link types
- Filter media content (videos, images, galleries)
- Learn AutoModerator YAML syntax
- Reduce manual moderation workload

## How to Use

### Step 1: Build Your Rule
1. Click **"Add New Rule"** to create a new rule (or use Rule 1)
2. Optionally select a **Standard Condition** for common filtering
3. Select the **rule type** (submission, comment, any, etc.)
4. Set **priority** if you need specific execution order
5. Toggle **moderator exemption** as needed
6. Toggle **ignore blockquotes** if you want to skip quoted text

### Step 2: Add Search Checks
1. Click **"Add Check"** in the Search Checks section
2. Click **"Regex Help"** for pattern examples if needed
3. Select one or more **fields** to search (title, body, domain, etc.)
4. Choose **match type** (includes word, regex, etc.)
5. Enter **keywords or patterns** (comma-separated)
6. Optionally enable **case sensitivity**
7. Optionally enable **reverse (NOT)** to invert the match

### Step 3: Set Author Conditions
1. Click **"Add Condition"** in Author Conditions
2. Choose condition **type** (account age, karma, email, etc.)
3. For karma/age: set **operator** (< or >) and **threshold value**
4. For account age: select the **time unit**
5. For boolean checks: select **true** or **false**

### Step 4: Configure Actions
1. Click **"Add Action"** in the Actions section
2. Select **action type** (remove, filter, spam, approve, report)
3. Add optional **action reason** for mod log (use `{{match}}` for matched text)

### Step 5: Add Auto-Responses (Optional)
1. Enter **comment text** for auto-comments
   - Check "Pin comment (sticky)" to sticky it
   - Check "Lock comment" to prevent replies
2. Enter **modmail text** to notify moderators
   - Add custom modmail subject if desired
3. Enter **message text** to notify the author
   - Add custom message subject if desired
4. Use **placeholders** in your text for dynamic content

### Step 6: Copy and Deploy
1. Review the **generated YAML** in the right panel
2. Click the **"Copy"** button
3. Navigate to `/r/yoursubreddit/wiki/config/automoderator`
4. Paste the code into your AutoModerator config
5. Save and **test in a private test subreddit first!**

## Example Rules

### Filter New Accounts with Low Karma
```yaml
type: submission
moderators_exempt: true
author:
    account_age: "< 7 days"
    combined_karma: "< 50"
action: filter
action_reason: "New account with low karma"
message: |
    Your post has been filtered for moderator review. This is because your account is new. Once approved by a moderator, your post will be visible to everyone.
```

### Remove Spam Keywords
```yaml
type: any
moderators_exempt: true
title+body (includes-word): ["spam", "scam", "bot", "click here"]
action: remove
action_reason: "Spam keywords detected: {{match}}"
comment: |
    Your post has been removed for containing prohibited content.
    
    If you believe this was a mistake, please contact the moderators.
comment_stickied: true
comment_locked: true
```

### Block Image Hosting Sites
```yaml
standard: image hosting sites
type: submission
moderators_exempt: true
action: remove
action_reason: "Image hosting site blocked"
message: |
    Your post has been removed because links to image hosting sites are not allowed. Please upload images directly to Reddit.
```

### Filter Users Without Verified Email
```yaml
type: any
moderators_exempt: true
author:
    has_verified_email: false
action: filter
action_reason: "User does not have verified email"
modmail: |
    A post from an unverified user is in the modqueue for review.
modmail_subject: "Unverified User Alert"
```

### Remove Posts with Amazon Affiliate Links
```yaml
standard: amazon affiliate links
type: submission
moderators_exempt: true
action: spam
action_reason: "Amazon affiliate link detected"
```

## Contributing

Contributions are welcome! Here's how you can help:

### Report Issues
- Found a bug? [Open an issue](https://github.com/Aryan-Raj-7167/automod-generator/issues)
- Include steps to reproduce
- Share your browser/device info

### Suggest Features
- Have an idea? [Create a feature request](https://github.com/Aryan-Raj-7167/automod-generator/issues)
- Explain the use case
- Describe expected behavior

### Submit Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a PR with clear description

## FAQ

**Q: Do I need to know YAML to use this tool?**  
A: No! That's the whole point - build rules visually and get valid YAML automatically.

**Q: Does this work for all AutoModerator features?**  
A: It covers the most common features. Some advanced features may require manual YAML editing.

**Q: Can I edit the generated YAML?**  
A: Yes! Copy the code and modify it as needed before pasting to Reddit.

**Q: Is my data saved?**  
A: No, everything runs in your browser. Your rules are not stored or transmitted anywhere.

**Q: Can I use this for multiple subreddits?**  
A: Yes! Generate rules and deploy them to any subreddit you moderate.

**Q: What are Standard Conditions?**  
A: Pre-made lists maintained by Reddit for common filtering needs (e.g., blocking all image hosting sites at once).

**Q: What does the "Reverse (NOT)" option do?**  
A: It inverts the match - the rule triggers when the text is NOT found instead of when it IS found.

**Q: Can I check multiple fields at once?**  
A: Yes! You can select multiple fields (like title + body) to search them all simultaneously.

## Resources

### Official Documentation
- [AutoModerator Full Documentation](https://www.reddit.com/wiki/automoderator/full-documentation)
- [AutoModerator Writing Basic Rules](https://www.reddit.com/wiki/automoderator/writing-basic-rules)
- [AutoModerator Library](https://www.reddit.com/r/AutoModerator/wiki/library)

### Community
- [r/AutoModerator](https://www.reddit.com/r/AutoModerator) - Help and discussion
- [r/modhelp](https://www.reddit.com/r/modhelp) - General moderator help
- [r/ModSupport](https://www.reddit.com/r/ModSupport) - Official Reddit support

### Learning Resources
- [YAML Syntax Guide](https://yaml.org/spec/1.2/spec.html)
- [Regular Expressions Tutorial](https://regexone.com/)
- [Reddit Mod Guidelines](https://www.redditinc.com/policies/moderator-guidelines)

## License

**MIT License**

## Support

If you find this tool helpful:
- **Star ⭐ this repository** on GitHub
- **Share it** with other moderators
- **Report bugs** to help improve it
- **Suggest features** you'd like to see

## Acknowledgments

- Reddit AutoModerator team for the comprehensive documentation
- Reddit moderator community for feedback and suggestions
- Open source contributors who make tools like this possible

---

**Built for the Reddit moderator community**

Made with ❤️ by **Aryan Raj** ([u/Aryan_Raj_7167](https://www.reddit.com/user/Aryan_Raj_7167))