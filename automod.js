const { useState } = React;

function AutoModGenerator() {
    const [rules, setRules] = useState([{
        id: 1,
        type: 'any',
        priority: '',
        moderatorsExempt: true,
        searchChecks: [],
        conditions: [],
        actions: [],
        comment: '',
        commentStickied: false,
        commentLocked: false,
        modmail: '',
        modmailSubject: '',
        message: '',
        messageSubject: '',
        standardCondition: '',
        ignoreBlockquotes: false
    }]);

    const [activeRule, setActiveRule] = useState(0);
    const [showRegexHelp, setShowRegexHelp] = useState(false);
    const [showBeginnerTips, setShowBeginnerTips] = useState(true);

    const addRule = () => {
        setRules([...rules, {
            id: rules.length + 1,
            type: 'any',
            priority: '',
            moderatorsExempt: true,
            searchChecks: [],
            conditions: [],
            actions: [],
            comment: '',
            commentStickied: false,
            commentLocked: false,
            modmail: '',
            modmailSubject: '',
            message: '',
            messageSubject: '',
            standardCondition: '',
            ignoreBlockquotes: false
        }]);
        setActiveRule(rules.length);
    };

    const removeRule = (index) => {
        const newRules = rules.filter((_, i) => i !== index);
        setRules(newRules);
        if (activeRule >= newRules.length) {
            setActiveRule(Math.max(0, newRules.length - 1));
        }
    };

    const updateRule = (field, value) => {
        const newRules = [...rules];
        newRules[activeRule][field] = value;
        setRules(newRules);
    };

    const addSearchCheck = () => {
        const newRules = [...rules];
        newRules[activeRule].searchChecks.push({
            fields: ['title'],
            modifier: 'includes-word',
            values: [''],
            caseSensitive: false,
            reverse: false
        });
        setRules(newRules);
    };

    const updateSearchCheck = (index, field, value) => {
        const newRules = [...rules];
        newRules[activeRule].searchChecks[index][field] = value;
        setRules(newRules);
    };

    const removeSearchCheck = (index) => {
        const newRules = [...rules];
        newRules[activeRule].searchChecks.splice(index, 1);
        setRules(newRules);
    };

    const toggleField = (index, field) => {
        const newRules = [...rules];
        const check = newRules[activeRule].searchChecks[index];
        const fieldIndex = check.fields.indexOf(field);
        
        if (fieldIndex > -1) {
            if (check.fields.length > 1) {
                check.fields.splice(fieldIndex, 1);
            }
        } else {
            check.fields.push(field);
        }
        
        setRules(newRules);
    };

    const addCondition = () => {
        const newRules = [...rules];
        newRules[activeRule].conditions.push({
            type: 'account_age',
            operator: '<',
            value: '7',
            unit: 'days'
        });
        setRules(newRules);
    };

    const updateCondition = (index, field, value) => {
        const newRules = [...rules];
        const condition = newRules[activeRule].conditions[index];
        
        if (field === 'type') {
            if (value === 'has_verified_email' || value === 'is_gold' || value === 'is_contributor' || value === 'is_moderator') {
                condition.type = value;
                condition.value = 'true';
                delete condition.operator;
                delete condition.unit;
            } else if (value === 'account_age') {
                condition.type = value;
                condition.operator = '<';
                condition.value = '7';
                condition.unit = 'days';
            } else {
                condition.type = value;
                condition.operator = '<';
                condition.value = '10';
                delete condition.unit;
            }
        } else {
            condition[field] = value;
        }
        
        setRules(newRules);
    };

    const removeCondition = (index) => {
        const newRules = [...rules];
        newRules[activeRule].conditions.splice(index, 1);
        setRules(newRules);
    };

    const addAction = () => {
        const newRules = [...rules];
        newRules[activeRule].actions.push({
            type: 'remove',
            reason: ''
        });
        setRules(newRules);
    };

    const updateAction = (index, field, value) => {
        const newRules = [...rules];
        newRules[activeRule].actions[index][field] = value;
        setRules(newRules);
    };

    const removeAction = (index) => {
        const newRules = [...rules];
        newRules[activeRule].actions.splice(index, 1);
        setRules(newRules);
    };

    const generateYAML = () => {
        return rules.map(rule => {
            let yaml = '';

            if (rule.standardCondition) {
                yaml += `standard: ${rule.standardCondition}\n`;
            }

            if (rule.type !== 'any') yaml += `type: ${rule.type}\n`;
            if (rule.priority) yaml += `priority: ${rule.priority}\n`;
            yaml += `moderators_exempt: ${rule.moderatorsExempt}\n`;

            rule.searchChecks.forEach(check => {
                const prefix = check.reverse ? '~' : '';
                const fieldStr = check.fields.join('+');
                const modifier = check.caseSensitive ? `(${check.modifier}, case-sensitive)` : `(${check.modifier})`;
                const values = check.values.filter(v => v.trim()).map(v => {
                    if (check.modifier === 'regex') {
                        return `'${v}'`;
                    }
                    return `"${v}"`;
                }).join(', ');
                if (values) {
                    yaml += `${prefix}${fieldStr} ${modifier}: [${values}]\n`;
                }
            });

            if (rule.conditions.length > 0) {
                yaml += `author:\n`;
                rule.conditions.forEach(cond => {
                    if (cond.type === 'account_age') {
                        yaml += `    account_age: "${cond.operator} ${cond.value} ${cond.unit}"\n`;
                    } else if (cond.type === 'comment_karma' || cond.type === 'post_karma' || cond.type === 'combined_karma') {
                        const op = cond.operator === '>' ? `'${cond.operator} ${cond.value}'` : `"${cond.operator} ${cond.value}"`;
                        yaml += `    ${cond.type}: ${op}\n`;
                    } else if (cond.type === 'has_verified_email' || cond.type === 'is_gold' || cond.type === 'is_contributor' || cond.type === 'is_moderator') {
                        yaml += `    ${cond.type}: ${cond.value}\n`;
                    }
                });
            }

            rule.actions.forEach(action => {
                if (action.type) {
                    yaml += `action: ${action.type}\n`;
                    if (action.reason) {
                        yaml += `action_reason: "${action.reason}"\n`;
                    }
                }
            });

            if (rule.comment) {
                yaml += `comment: |\n`;
                rule.comment.split('\n').forEach(line => {
                    yaml += `    ${line}\n`;
                });
                if (rule.commentStickied) {
                    yaml += `comment_stickied: true\n`;
                }
                if (rule.commentLocked) {
                    yaml += `comment_locked: true\n`;
                }
            }

            if (rule.modmail) {
                yaml += `modmail: |\n`;
                rule.modmail.split('\n').forEach(line => {
                    yaml += `    ${line}\n`;
                });
                if (rule.modmailSubject) {
                    yaml += `modmail_subject: "${rule.modmailSubject}"\n`;
                }
            }

            if (rule.message) {
                yaml += `message: |\n`;
                rule.message.split('\n').forEach(line => {
                    yaml += `    ${line}\n`;
                });
                if (rule.messageSubject) {
                    yaml += `message_subject: "${rule.messageSubject}"\n`;
                }
            }

            if (rule.ignoreBlockquotes) {
                yaml += `ignore_blockquotes: true\n`;
            }

            return yaml;
        }).join('---\n');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateYAML());
        alert('✅ Copied to clipboard!');
    };

    const currentRule = rules[activeRule];

    const fieldOptions = [
        { value: 'title', label: 'Title', desc: 'Post title' },
        { value: 'body', label: 'Body', desc: 'Post/comment text' },
        { value: 'domain', label: 'Domain', desc: 'Website domain' },
        { value: 'url', label: 'URL', desc: 'Full link' },
        { value: 'flair_text', label: 'Flair Text', desc: 'Flair label' },
        { value: 'flair_css_class', label: 'Flair CSS Class', desc: 'Flair class' },
        { value: 'flair_template_id', label: 'Flair Template ID', desc: 'Flair template' },
        { value: 'id', label: 'ID', desc: 'Post/comment ID' },
        { value: 'media_title', label: 'Media Title', desc: 'Video/media title' },
        { value: 'media_description', label: 'Media Description', desc: 'Video description' },
        { value: 'media_author', label: 'Media Author', desc: 'Channel/uploader' },
        { value: 'media_author_url', label: 'Media Author URL', desc: 'Channel URL' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        <i className="fa-brands fa-reddit text-orange-500"></i> AutoModerator Rule Generator
                    </h1>
                    <p className="text-gray-600 mb-3">Build Reddit AutoModerator rules visually - No coding required!</p>
                    <button 
                        onClick={() => setShowBeginnerTips(!showBeginnerTips)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        <i className={`fa-solid fa-chevron-${showBeginnerTips ? 'up' : 'down'}`}></i>
                        {showBeginnerTips ? 'Hide' : 'Show'} Beginner Tips
                    </button>
                </div>

                {/* Beginner Tips */}
                {showBeginnerTips && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6 shadow">
                        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-lightbulb"></i> Quick Start Guide
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-4 rounded border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">What is AutoModerator?</h4>
                                <p className="text-gray-700">AutoModerator is Reddit's automated moderator that follows rules you create to automatically moderate your subreddit.</p>
                            </div>
                            <div className="bg-white p-4 rounded border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">How to use this tool?</h4>
                                <p className="text-gray-700">1. Add conditions (what to check) 2. Add actions (what to do) 3. Copy the generated code 4. Paste in your subreddit's AutoMod config</p>
                            </div>
                            <div className="bg-white p-4 rounded border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">Search Checks</h4>
                                <p className="text-gray-700">Filter posts by title, body text, or domain. Perfect for blocking spam keywords or specific websites.</p>
                            </div>
                            <div className="bg-white p-4 rounded border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">Author Conditions</h4>
                                <p className="text-gray-700">Filter users by account age or karma. Useful for preventing spam from new accounts.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {/* Rule Tabs */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    <i className="fa-solid fa-layer-group"></i> Your Rules
                                </h2>
                                <button onClick={addRule} className="ml-auto bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 flex items-center gap-1 text-sm shadow">
                                    <i className="fa-solid fa-plus"></i> Add New Rule
                                </button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {rules.map((rule, index) => (
                                    <div key={rule.id} className="flex items-center gap-1">
                                        <button
                                            onClick={() => setActiveRule(index)}
                                            className={`px-3 py-2 rounded transition ${activeRule === index ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            <i className="fa-solid fa-file-lines"></i> Rule {index + 1}
                                        </button>
                                        {rules.length > 1 && (
                                            <button onClick={() => removeRule(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Basic Settings */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <i className="fa-solid fa-sliders text-orange-500"></i> Basic Settings
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Configure when and how this rule applies</p>
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-400 pl-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-star"></i> Standard Condition (optional)
                                    </label>
                                    <select
                                        value={currentRule.standardCondition}
                                        onChange={(e) => updateRule('standardCondition', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">None - Custom rule</option>
                                        <option value="image hosting sites">Image Hosting Sites (Imgur, etc.)</option>
                                        <option value="direct image links">Direct Image Links (.jpg, .png)</option>
                                        <option value="video hosting sites">Video Hosting Sites (YouTube, etc.)</option>
                                        <option value="streaming sites">Streaming Sites (Twitch, etc.)</option>
                                        <option value="crowdfunding sites">Crowdfunding Sites (GoFundMe, etc.)</option>
                                        <option value="meme generator sites">Meme Generator Sites</option>
                                        <option value="facebook links">Facebook Links</option>
                                        <option value="amazon affiliate links">Amazon Affiliate Links</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Pre-made lists for common filtering needs</p>
                                </div>
                                
                                <div className="border-l-4 border-purple-400 pl-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-filter"></i> Rule Type
                                    </label>
                                    <select
                                        value={currentRule.type}
                                        onChange={(e) => updateRule('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="any">Any - Posts & Comments</option>
                                        <option value="submission">Submission - Posts only</option>
                                        <option value="comment">Comment - Comments only</option>
                                        <option value="text submission">Text Submission - Text posts only</option>
                                        <option value="link submission">Link Submission - Link posts only</option>
                                        <option value="crosspost submission">Crosspost Submission</option>
                                        <option value="poll submission">Poll Submission</option>
                                        <option value="gallery submission">Gallery Submission</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Choose what content type this rule applies to</p>
                                </div>

                                <div className="border-l-4 border-green-400 pl-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-arrow-up-1-9"></i> Priority (optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={currentRule.priority}
                                        onChange={(e) => updateRule('priority', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Higher numbers run first (leave empty for default)</p>
                                </div>

                                <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded">
                                    <input
                                        type="checkbox"
                                        id="modExempt"
                                        checked={currentRule.moderatorsExempt}
                                        onChange={(e) => updateRule('moderatorsExempt', e.target.checked)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="modExempt" className="text-sm font-medium text-gray-700">
                                            <i className="fa-solid fa-shield-halved text-green-600"></i> Exempt moderators from this rule
                                        </label>
                                        <p className="text-xs text-gray-500">Recommended: Keep checked so mods can bypass the rule</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded">
                                    <input
                                        type="checkbox"
                                        id="ignoreBlockquotes"
                                        checked={currentRule.ignoreBlockquotes}
                                        onChange={(e) => updateRule('ignoreBlockquotes', e.target.checked)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <label htmlFor="ignoreBlockquotes" className="text-sm font-medium text-gray-700">
                                            <i className="fa-solid fa-quote-left text-blue-600"></i> Ignore text in blockquotes
                                        </label>
                                        <p className="text-xs text-gray-500">Skip checking text inside quoted sections</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Checks */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="fa-solid fa-magnifying-glass text-blue-500"></i> Search Checks
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowRegexHelp(!showRegexHelp)}
                                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1 text-sm"
                                    >
                                        <i className="fa-solid fa-circle-question"></i> Regex Help
                                    </button>
                                    <button onClick={addSearchCheck} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-sm shadow">
                                        <i className="fa-solid fa-plus"></i> Add Check
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Filter content by searching for specific words, phrases, or patterns</p>

                            {showRegexHelp && (
                                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded text-xs">
                                    <h4 className="font-bold mb-2 text-blue-800 flex items-center gap-2">
                                        <i className="fa-solid fa-code"></i> Regular Expression (Regex) Quick Reference
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-blue-700">
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">\\b</code> Word boundary</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">\\d</code> Any digit (0-9)</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">\\w</code> Word character</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">\\s</code> Whitespace</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">.</code> Any character</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">*</code> 0 or more</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">+</code> 1 or more</div>
                                        <div><code className="bg-blue-100 px-2 py-1 rounded">?</code> 0 or 1</div>
                                        <div className="col-span-2"><code className="bg-blue-100 px-2 py-1 rounded">(dog|cat)</code> Match "dog" OR "cat"</div>
                                    </div>
                                    <p className="mt-2 font-semibold text-blue-900">Tip: Use single quotes for regex to avoid escaping issues!</p>
                                </div>
                            )}

                            {currentRule.searchChecks.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                                    <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-2"></i>
                                    <p className="text-gray-500 text-sm">No search checks yet</p>
                                    <p className="text-gray-400 text-xs">Click "Add Check" to filter content</p>
                                </div>
                            )}

                            {currentRule.searchChecks.map((check, index) => (
                                <div key={index} className="border-2 border-blue-200 rounded-lg p-4 mb-3 bg-blue-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-blue-800">
                                            <i className="fa-solid fa-filter"></i> Check #{index + 1}
                                        </span>
                                        <button onClick={() => removeSearchCheck(index)} className="text-red-500 hover:text-red-700 hover:bg-red-100 px-2 py-1 rounded">
                                            <i className="fa-solid fa-trash"></i> Remove
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {/* Field Selection */}
                                        <div className="bg-white p-3 rounded border border-blue-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-bullseye"></i> What to check? (Select one or more)
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {fieldOptions.map(field => (
                                                    <label key={field.value} className={`flex items-start p-2 rounded cursor-pointer transition ${check.fields.includes(field.value) ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 border border-gray-300 hover:bg-gray-100'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={check.fields.includes(field.value)}
                                                            onChange={() => toggleField(index, field.value)}
                                                            className="mt-1 mr-2"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-xs font-semibold">{field.label}</div>
                                                            <div className="text-xs text-gray-500">{field.desc}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2 font-semibold">
                                                Selected: {check.fields.map(f => f.toUpperCase()).join(' + ')}
                                            </p>
                                        </div>

                                        {/* Match Type */}
                                        <div className="bg-white p-3 rounded border border-blue-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-crosshairs"></i> How to match?
                                            </label>
                                            <select
                                                value={check.modifier}
                                                onChange={(e) => updateSearchCheck(index, 'modifier', e.target.value)}
                                                className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="includes-word">Includes Word - Matches whole words only</option>
                                                <option value="includes">Includes - Matches anywhere (even partial)</option>
                                                <option value="full-exact">Full Exact - Must match completely</option>
                                                <option value="full-text">Full Text - Ignores spacing/punctuation</option>
                                                <option value="starts-with">Starts With - Must begin with text</option>
                                                <option value="ends-with">Ends With - Must end with text</option>
                                                <option value="regex">Regular Expression - Advanced patterns</option>
                                            </select>
                                        </div>

                                        {/* Values */}
                                        <div className="bg-white p-3 rounded border border-blue-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-list"></i> What words/phrases to look for?
                                                {check.modifier === 'regex' && <span className="text-red-600 ml-1">(Advanced - Use regex patterns)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={check.values.join(', ')}
                                                onChange={(e) => updateSearchCheck(index, 'values', e.target.value.split(',').map(v => v.trim()))}
                                                placeholder={check.modifier === 'regex' ? 'spam\\w+, \\b(bad|word)\\b' : 'spam, scam, bot, click here'}
                                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Separate multiple values with commas</p>
                                        </div>

                                        {/* Options */}
                                        <div className="bg-white p-3 rounded border border-blue-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-gear"></i> Options
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id={`case-${index}`}
                                                        checked={check.caseSensitive}
                                                        onChange={(e) => updateSearchCheck(index, 'caseSensitive', e.target.checked)}
                                                        className="mt-1 mr-2"
                                                    />
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700">Case Sensitive</div>
                                                        <div className="text-xs text-gray-500">"Spam" and "spam" are different</div>
                                                    </div>
                                                </label>
                                                <label className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id={`reverse-${index}`}
                                                        checked={check.reverse}
                                                        onChange={(e) => updateSearchCheck(index, 'reverse', e.target.checked)}
                                                        className="mt-1 mr-2"
                                                    />
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700">Reverse (NOT)</div>
                                                        <div className="text-xs text-gray-500">Match when text is NOT found</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Author Conditions */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="fa-solid fa-user text-purple-500"></i> Author Conditions
                                </h3>
                                <button onClick={addCondition} className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 flex items-center gap-1 text-sm shadow">
                                    <i className="fa-solid fa-plus"></i> Add Condition
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Filter posts based on the author's account age, karma, or status</p>

                            {currentRule.conditions.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                                    <i className="fa-solid fa-user-check text-4xl text-gray-300 mb-2"></i>
                                    <p className="text-gray-500 text-sm">No author conditions yet</p>
                                    <p className="text-gray-400 text-xs">Click "Add Condition" to filter by user</p>
                                </div>
                            )}

                            {currentRule.conditions.map((cond, index) => (
                                <div key={index} className="border-2 border-purple-200 rounded-lg p-4 mb-3 bg-purple-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-purple-800">
                                            <i className="fa-solid fa-user-check"></i> Condition #{index + 1}
                                        </span>
                                        <button onClick={() => removeCondition(index)} className="text-red-500 hover:text-red-700 hover:bg-red-100 px-2 py-1 rounded">
                                            <i className="fa-solid fa-trash"></i> Remove
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded border border-purple-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-list-check"></i> Check Type
                                            </label>
                                            <select
                                                value={cond.type}
                                                onChange={(e) => updateCondition(index, 'type', e.target.value)}
                                                className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="account_age">Account Age - How old is the account?</option>
                                                <option value="comment_karma">Comment Karma - Points from comments</option>
                                                <option value="post_karma">Post Karma - Points from posts</option>
                                                <option value="combined_karma">Combined Karma - Total points</option>
                                                <option value="has_verified_email">Has Verified Email</option>
                                                <option value="is_gold">Has Reddit Gold/Premium</option>
                                                <option value="is_contributor">Is Approved Contributor</option>
                                                <option value="is_moderator">Is Moderator</option>
                                            </select>
                                        </div>

                                        {/* Karma/Age conditions */}
                                        {(cond.type !== 'has_verified_email' && cond.type !== 'is_gold' && cond.type !== 'is_contributor' && cond.type !== 'is_moderator') && (
                                            <>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white p-3 rounded border border-purple-200">
                                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Comparison</label>
                                                        <select
                                                            value={cond.operator}
                                                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                                            className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        >
                                                            <option value="<">Less than (&lt;)</option>
                                                            <option value=">">Greater than (&gt;)</option>
                                                        </select>
                                                    </div>
                                                    <div className="bg-white p-3 rounded border border-purple-200">
                                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Value</label>
                                                        <input
                                                            type="number"
                                                            value={cond.value}
                                                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                            className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                                {cond.type === 'account_age' && (
                                                    <div className="bg-white p-3 rounded border border-purple-200">
                                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Time Unit</label>
                                                        <select
                                                            value={cond.unit}
                                                            onChange={(e) => updateCondition(index, 'unit', e.target.value)}
                                                            className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        >
                                                            <option value="minutes">Minutes</option>
                                                            <option value="hours">Hours</option>
                                                            <option value="days">Days</option>
                                                            <option value="weeks">Weeks</option>
                                                            <option value="months">Months</option>
                                                            <option value="years">Years</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                                                    <i className="fa-solid fa-lightbulb"></i> <strong>Example:</strong> Account age &lt; 7 days = blocks new accounts less than 1 week old
                                                </div>
                                            </>
                                        )}

                                        {/* Boolean conditions */}
                                        {(cond.type === 'has_verified_email' || cond.type === 'is_gold' || cond.type === 'is_contributor' || cond.type === 'is_moderator') && (
                                            <>
                                                <div className="bg-white p-3 rounded border border-purple-200">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Must be?</label>
                                                    <select
                                                        value={cond.value || 'true'}
                                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                        className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="true">True (Must have/be)</option>
                                                        <option value="false">False (Must NOT have/be)</option>
                                                    </select>
                                                </div>
                                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                                                    <i className="fa-solid fa-lightbulb"></i> <strong>Example:</strong> Has verified email = true means only users with verified emails can post
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="fa-solid fa-bolt text-green-500"></i> Actions
                                </h3>
                                <button onClick={addAction} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-sm shadow">
                                    <i className="fa-solid fa-plus"></i> Add Action
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">What should happen when the conditions above are met?</p>

                            {currentRule.actions.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                                    <i className="fa-solid fa-hand text-4xl text-gray-300 mb-2"></i>
                                    <p className="text-gray-500 text-sm">No actions yet</p>
                                    <p className="text-gray-400 text-xs">Click "Add Action" to do something</p>
                                </div>
                            )}

                            {currentRule.actions.map((action, index) => (
                                <div key={index} className="border-2 border-green-200 rounded-lg p-4 mb-3 bg-green-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-green-800">
                                            <i className="fa-solid fa-play"></i> Action #{index + 1}
                                        </span>
                                        <button onClick={() => removeAction(index)} className="text-red-500 hover:text-red-700 hover:bg-red-100 px-2 py-1 rounded">
                                            <i className="fa-solid fa-trash"></i> Remove
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded border border-green-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-hammer"></i> Action Type
                                            </label>
                                            <select
                                                value={action.type}
                                                onChange={(e) => updateAction(index, 'type', e.target.value)}
                                                className="w-full px-2 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="remove">Remove - Delete the post/comment</option>
                                                <option value="spam">Spam - Mark as spam and remove</option>
                                                <option value="filter">Filter - Send to modqueue for review</option>
                                                <option value="approve">Approve - Allow it through</option>
                                                <option value="report">Report - Create a report for mods</option>
                                            </select>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-green-200">
                                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                <i className="fa-solid fa-comment"></i> Reason (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={action.reason}
                                                onChange={(e) => updateAction(index, 'reason', e.target.value)}
                                                placeholder="e.g., Spam keyword detected"
                                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Shows in mod log. Use {'{{match}}'} to show what was matched</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Messages */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <i className="fa-solid fa-envelope text-orange-500"></i> Messages & Comments
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Send automated messages or leave comments when rules trigger</p>
                            
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-400 pl-3 bg-blue-50 p-3 rounded">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-comment-dots"></i> Auto Comment (optional)
                                    </label>
                                    <textarea
                                        value={currentRule.comment}
                                        onChange={(e) => updateRule('comment', e.target.value)}
                                        placeholder="Leave a public comment explaining why action was taken..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                    />
                                    {currentRule.comment && (
                                        <div className="mt-2 space-y-2 bg-white p-2 rounded">
                                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    id="commentStickied"
                                                    checked={currentRule.commentStickied}
                                                    onChange={(e) => updateRule('commentStickied', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">Pin comment (sticky)</div>
                                                    <div className="text-xs text-gray-500">Keep comment at top of post</div>
                                                </div>
                                            </label>
                                            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    id="commentLocked"
                                                    checked={currentRule.commentLocked}
                                                    onChange={(e) => updateRule('commentLocked', e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700">Lock comment</div>
                                                    <div className="text-xs text-gray-500">Prevent replies to comment</div>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="border-l-4 border-yellow-400 pl-3 bg-yellow-50 p-3 rounded">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-envelope"></i> Modmail (optional)
                                    </label>
                                    <textarea
                                        value={currentRule.modmail}
                                        onChange={(e) => updateRule('modmail', e.target.value)}
                                        placeholder="Send private message to mod team..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                    />
                                    {currentRule.modmail && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={currentRule.modmailSubject}
                                                onChange={(e) => updateRule('modmailSubject', e.target.value)}
                                                placeholder="Subject (optional, defaults to 'AutoModerator notification')"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="border-l-4 border-purple-400 pl-3 bg-purple-50 p-3 rounded">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <i className="fa-solid fa-paper-plane"></i> Message to Author (optional)
                                    </label>
                                    <textarea
                                        value={currentRule.message}
                                        onChange={(e) => updateRule('message', e.target.value)}
                                        placeholder="Send private message to the post/comment author..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                    />
                                    {currentRule.message && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={currentRule.messageSubject}
                                                onChange={(e) => updateRule('messageSubject', e.target.value)}
                                                placeholder="Subject (optional, defaults to 'AutoModerator notification')"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded">
                                    <p className="font-semibold mb-2 text-sm flex items-center gap-2">
                                        <i className="fa-solid fa-code text-blue-600"></i> Available Placeholders
                                    </p>
                                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                                        <code className="bg-white px-2 py-1 rounded">{'{{author}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{title}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{body}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{domain}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{url}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{permalink}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{subreddit}}'}</code>
                                        <code className="bg-white px-2 py-1 rounded">{'{{match}}'}</code>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">Use these in your messages to include dynamic content</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Generated Code */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <i className="fa-solid fa-code text-green-600"></i> Generated YAML
                                </h3>
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 flex items-center gap-1 text-sm shadow transition"
                                >
                                    <i className="fa-solid fa-copy"></i> Copy
                                </button>
                            </div>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto font-mono border-2 border-gray-700">
                                {generateYAML() || '# Add conditions and actions to generate code'}
                            </pre>
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded">
                                <div className="flex items-start gap-2">
                                    <i className="fa-solid fa-circle-info text-blue-600 text-sm"></i>
                                    <div className="text-xs">
                                        <p className="text-blue-800 font-semibold mb-2">How to deploy:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                            <li>Click "Copy" button above</li>
                                            <li>Go to <code className="bg-blue-100 px-1 rounded">/r/yoursubreddit/wiki/config/automoderator</code></li>
                                            <li>Paste the code</li>
                                            <li>Save the page</li>
                                        </ol>
                                        <p className="mt-3 font-bold text-red-600">
                                            Always test in a private test subreddit first!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}