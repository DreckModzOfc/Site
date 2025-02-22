const start = {
    for: function(page) {
        switch (page) {
            case 'account':
                init.account();
                break;
            default: 
                init.main();
                break;
        }
        inits.init();
    }
};

const requests = {
    get: (url, params = {}) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'GET',
                data: params,
                dataType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    console.error('GET request failed:', error);
                    console.log(xhr.message);
                    reject(error);
                }
            });
        });
    },

    post: (url, data = {}) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'POST',
                data: data,
                dataType: 'json',
                success: function(response) {
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    console.error('POST request failed:', error);
                    reject(error);
                }
            });
        });
    },
};

const aos = {
    init: function() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const animation = $(entry.target).data('aos') || 'fade-up';
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        $(entry.target).removeClass('hide').addClass(animation);
                    }, $(entry.target).data('aos-delay') || 100);
                }
                $(entry.target).addClass('hide').removeClass(animation);
            });
        });
        
        const observe = (elements) => {
            elements.each(function() {
                observer.observe(this);
            });
        }

        const elements = [
            $('[data-aos="fade-in"]'),
            $('[data-aos="fade-out"]'),
            $('[data-aos="fade-up"]'),
            $('[data-aos="fade-down"]'),
            $('[data-aos="fade-left"]'),
            $('[data-aos="fade-right"]')
        ]
        
        elements.forEach(elements => observe(elements));
    }
}

const modals = {
    new: function(options) {
        const $modal = $('.modal');

        function drop(callback) {
            const $containers = $modal.find('.modal-container');
            if ($containers.length > 0) {
                $modal.css({
                    'animation': 'opacity-out 300ms ease-in-out forwards'
                });
                $containers.css({
                    'animation': 'fade-out 300ms ease-in-out forwards'
                });
                $modal.one('animationend', function() {
                    $modal.css('display', 'none');
                    $containers.remove();
                    if (callback) callback();
                });
            } else if (callback) {
                callback();
            }
        }

        function create() {
            $modal.css({
                'display': 'flex',
                'animation': 'opacity-in 300ms ease-in-out forwards'
            });

            $modal.one('animationend', function() {
                $modal.off('animationend');

                const $container = $('<div class="modal-container"></div>');
                const $content = $('<div class="modal-content"></div>').appendTo($container);

                // Set icon
                if (options.icon) {
                    const $icon = $(`<div class="modal-icon" style="${options.icon.color ? `--bg-color: ${options.icon.color}` : ''} "></div>`).appendTo($content);
                    $(`<i class="${options.icon.icon}"></i>`).appendTo($icon);
                }

                // Set title
                if (options.title) {
                    $('<div class="gradient-text modal-title"></div>').text(options.title || 'Modal title').appendTo($content);
                }

                // Set description(s)
                if (Array.isArray(options.description)) {
                    options.description.forEach(description => {
                        if (description.text !== '') {
                            $('<div class="modal-description"></div>').html(description.text || '').appendTo($content);
                        }
                    });
                }

                if (options.type === 'form') {
                    if (Array.isArray(options.inputs)) {
                        const $formDiv = $('<div class="modal-form"></div>').appendTo($container);
                        const $form = $('<form autocomplete="off"></form>').appendTo($formDiv);
                        
                        
                        options.inputs.forEach(input => {
                            const $input = $(`<input type="text" name="${input.name}" placeholder="${input.placeholder || 'Input'}"${input.readonly ? ' readonly' : ''} value="${input.value || ''}">`).appendTo($form);
                            if (typeof input.event === 'function') {
                                $input.on('input', function() {
                                    input.event.call(this, $(this).val());
                                });
                            }
                        });

                        $form.on('submit', function(event) {
                            event.preventDefault();
                            const data = {};
                            $(this).serializeArray().forEach(field => {
                                if (field.name !== 'undefined') {
                                    data[field.name] = field.value;
                                }
                            });
                            if ($.isFunction(options.handler)) {
                                try {
                                    options.handler(data);
                                } catch (error) {
                                    console.error('Error in form handler:', error);
                                }
                            }
                        });
                    }
                } else if (options.type === 'choice') {
                    if (Array.isArray(options.choices)) {
                        const $choicesDiv = $('<div class="modal-choice"></div>').appendTo($container);
                        const $choices = $('<div class="modal-choices"></div>').appendTo($choicesDiv);
                        options.choices.forEach(choice => {
                            let $choice;
                            if (choice.tooltip) {
                                $choice = $(`<div class="choice small-tooltip" tooltip="${choice.tooltip || 'Choice tooltip'}"></div>`).appendTo($choices);
                            } else {
                                $choice = $('<div class="choice"></div>').appendTo($choices);
                            }
                            if (choice.img) {
                                $(`<img src="${choice.img || 'assets/img/logo.png'}" draggable="false">`).appendTo($choice);
                            } else if (choice.icon) {
                                $(`<i class="gradient-icon ${choice.icon}"></i>`).appendTo($choice);
                            }
                            if (typeof choice.onClick === 'function') {
                                $choice.on('click', choice.onClick);
                            }
                        });
                                                
                    }

                } else if (options.type === 'notification') {
                    // Readonly, clickable input(s)
                    if (Array.isArray(options.inputs)) {
                        const $formDiv = $('<div class="modal-form"></div>').appendTo($container);
                        const $form = $('<form></form>').appendTo($formDiv);
                        options.inputs.forEach(input => {
                            const $input = $(`<input type="text" name="${input.name}" placeholder="${input.placeholder || 'Input'}"${input.readonly ? ' readonly' : ''} value="${input.value || ''}">`).appendTo($form);
                            if (typeof input.event === 'function' && !input.readonly) {
                                $input.on('input', function() {
                                    input.event.call(this, $(this).val());
                                });
                            }
                            if (typeof input.onClick === 'function' && input.readonly) {
                                $input.on('click', function() {
                                    input.onClick($(this).val());
                                });
                            }
                        });
                    }
                }

                const $bottom = $('<div class="modal-bottom"></div>').appendTo($container);
                const $buttons = $('<div class="modal-buttons"></div>').appendTo($bottom);

                // Set buttons
                if (Array.isArray(options.buttons)) {
                    options.buttons.forEach(button => {
                        const $button = $('<div class="modal-button"></div>')
                            .text(button.text || 'Button')
                            .appendTo($buttons);

                        if (button.action === 'close') {
                            $button.on('click', function() {
                                if (typeof button.onClick === 'function') {
                                    button.onClick();
                                }
                                $modal.css({
                                    'animation': 'opacity-out 300ms ease-in-out forwards'
                                });
                                $container.css({
                                    'animation': 'fade-out 300ms ease-in-out forwards'
                                });
                                $modal.one('animationend', function() {
                                    $modal.css('display', 'none');
                                    $container.remove();
                                });
                            });
                        } else if (button.action === 'submit') {
                            $button.on('click', function() {
                                $modal.find('form').submit();
                                if (typeof button.onClick === 'function') {
                                    button.onClick();
                                }
                                if (button.close === true) {
                                    $modal.css({
                                        'animation': 'opacity-out 300ms ease-in-out forwards'
                                    });
                                    $container.css({
                                        'animation': 'fade-out 300ms ease-in-out forwards'
                                    });
                                    $modal.one('animationend', function() {
                                        $modal.css('display', 'none');
                                        $container.remove();
                                    });
                                }
                            });
                        } else if (typeof button.onClick === 'function') {
                            $button.on('click', button.onClick);
                        }
                    });
                } else {
                    const $button = $('<div class="modal-button"></div>')
                        .text(button.text || 'Button')
                        .appendTo($buttons);
                    $button.on('click', function() {
                        $modal.css({
                            'animation': 'opacity-out 300ms ease-in-out forwards'
                        });
                        $container.css({
                            'animation': 'fade-out 300ms ease-in-out forwards'
                        });
                        $modal.one('animationend', function() {
                            $modal.css('display', 'none');
                            $container.remove();
                        });
                    });
                }

                $modal.append($container);
            });
        }

        drop(create);
    }
};

const buttons = {
    init: function() {
        $(document).click(function(event) {
            if (!$(event.target).closest('.faq-box').length) {
                $('.faq-box').removeClass('expanded').find('i').removeClass('fa-minus').addClass('fa-plus');
            }
        });
        $(document).on('keydown', function(event) {
            if (event.key === 'Tab') {
                event.preventDefault();
            }
        });
        $(document).on('click', '[data-do], [data-redirect]', async function() {
            if (!$(this).attr('disabled')) {
                var redirect = $(this).data('redirect');
                if (redirect) {
                    window.location.href = $(this).data('redirect');
                }
                var data = $(this).data('do');
                let id = $(this).data('id');
                switch (data) {
                    case 'topup':
                        modals.new({
                            type: 'choice',
                            title: 'What would you like to deposit with?',
                            description: [
                                {
                                    text: 'Select your <span class="gradient-text">payment method</span> below'
                                }
                            ],
                            choices: [
                                {
                                    img: 'https://swagmode.net/assets/img/robux.png',
                                    onClick: function() {
                                        modals.new({
                                            type: 'choice',
                                            title: 'What would you like to purchase?',
                                            description: [
                                                {
                                                    text: 'Select your <span class="gradient-text">product</span> below'
                                                }
                                            ],
                                            choices: [
                                                {
                                                    icon: 'fas fa-star',
                                                    tooltip: 'SwagMode Premium',
                                                    onClick: function() {
                                                        modals.new({
                                                            type: 'form',
                                                            title: 'Enter your details',
                                                            description: [
                                                                {
                                                                    text: 'Input your <span>Roblox detail</span>, use your username or user ID below'
                                                                }
                                                            ],
                                                            inputs: [
                                                                {
                                                                    name: 'roblox',
                                                                    placeholder: 'Roblox detail',
                                                                    readonly: false,
                                                                },
                                                                {
                                                                    value: 'You will have to pay 5000 Robux',
                                                                    readonly: true
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Cancel',
                                                                    action: 'close'
                                                                },
                                                                {
                                                                    text: 'Submit',
                                                                    action: 'submit',
                                                                    close: true
                                                                }
                                                            ],
                                                            handler: async function(data) {
                                                                try {
                                                                    if (Object.keys(data).length) {
                                                                        data['product'] = 'premium';
                                                                        let response = await prepared.robuxTopup(data);
                                                                        if (response.success) {
                                                                            modals.new({
                                                                                type: 'notification',
                                                                                title: 'Waiting for payment',
                                                                                description: [
                                                                                    {
                                                                                        text: 'Your order expiries in <span class="gradient-text">5 minutes</span>'
                                                                                    },
                                                                                    {
                                                                                        text: 'Please purchase the <span class="gradient-text">item</span> you will be redirected to in a moment and <span class="gradient-text">do not close this page</span>'
                                                                                    },
                                                                                    {
                                                                                        text: 'Click to copy and open the URL to your <span class="gradient-text">item</span> below'
                                                                                    },
                                                                                ],
                                                                                inputs: [
                                                                                    {
                                                                                        value: response['checkout'],
                                                                                        readonly: true,
                                                                                        onClick: function (value) { window.open(value, '_blank'); utilities.setClipboard(value) }
                                                                                    }
                                                                                ],
                                                                                icon: {
                                                                                    color: '#fcba2d',
                                                                                    icon: 'fas fa-clock-rotate-left'
                                                                                },
                                                                                buttons: [
                                                                                    {
                                                                                        text: 'Close',
                                                                                        action: 'close'
                                                                                    }
                                                                                ]
                                                                            });
                                                                            setTimeout(() => {
                                                                                window.open(response.checkout, '_blank');
                                                                                const end = Date.now() + 299000;
                                                                                const check = async () => {
                                                                                    if (Date.now() >= end) {
                                                                                        clearInterval(timer);
                                                                                        modals.new({
                                                                                            type: 'notification',
                                                                                            title: 'Purchase failed',
                                                                                            description: [
                                                                                                {
                                                                                                    text: `Your purchase of <span class="gradient-text">${data['product']}</span> for <span class="gradient-text">${data['roblox']}</span> has expired`
                                                                                                }
                                                                                            ],
                                                                                            icon: {
                                                                                                color: '#6b0500',
                                                                                                icon: 'fas fa-x'
                                                                                            },
                                                                                            buttons: [
                                                                                                {
                                                                                                    text: 'Close',
                                                                                                    action: 'close'
                                                                                                }
                                                                                            ]
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    
                                                                                    const invoice = response['invoice'];
                                                                                    let check = await prepared.robuxCheck(invoice);
                                                                                    if (check.success) {
                                                                                        modals.new({
                                                                                            type: 'notification',
                                                                                            title: 'Order paid successfully',
                                                                                            description: [
                                                                                                {
                                                                                                    text: `A amount of <span class="gradient-text">$${check.amount}</span> has been added to your balance`
                                                                                                }
                                                                                            ],
                                                                                            icon: {
                                                                                                color: '#28a745',
                                                                                                icon: 'fas fa-check'
                                                                                            },
                                                                                            buttons: [
                                                                                                {
                                                                                                    text: 'Okay',
                                                                                                    action: 'close'
                                                                                                }
                                                                                            ]
                                                                                        });
                                                                                        clearInterval(timer);
                                                                                        await prepared.mobile(functions.updateMobile)
                                                                                    } else {
                                                                                        if (!check.message.includes('own')) {
                                                                                            modals.new({
                                                                                                type: 'notification',
                                                                                                title: `${check.message}`,
                                                                                                icon: {
                                                                                                    color: '#6b0500',
                                                                                                    icon: 'fas fa-x'
                                                                                                },
                                                                                                buttons: [
                                                                                                    {
                                                                                                        text: 'Close',
                                                                                                        action: 'close'
                                                                                                    }
                                                                                                ]
                                                                                            });
                                                                                            clearInterval(timer);
                                                                                        }
                                                                                    }
                                                                                }

                                                                                const timer = setInterval(check, 5000);
                                                                            }, 3000);
                                                                        } else {
                                                                            modals.new({
                                                                                type: 'notification',
                                                                                title: `${response.message}`,
                                                                                description: [
                                                                                    {
                                                                                        text: response.description
                                                                                    }
                                                                                ],
                                                                                icon: {
                                                                                    color: '#6b0500',
                                                                                    icon: 'fas fa-x'
                                                                                },
                                                                                buttons: [
                                                                                    {
                                                                                        text: 'Close',
                                                                                        action: 'close'
                                                                                    }
                                                                                ]
                                                                            });
                                                                        }
                                                                    } else {
                                                                        modals.new({
                                                                            type: 'notification',
                                                                            title: 'Missing fields',
                                                                            description: [
                                                                                {
                                                                                    text: 'Please fill out all fields and try again'
                                                                                }
                                                                            ],
                                                                            icon: {
                                                                                color: '#6b0500',
                                                                                icon: 'fas fa-x'
                                                                            },
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Close',
                                                                                    action: 'close'
                                                                                }
                                                                            ]
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    modals.new({
                                                                        type: 'notification',
                                                                        title: 'Error',
                                                                        description: [
                                                                            {
                                                                                text: 'Something went wrong during the top-up process'
                                                                            },
                                                                            {
                                                                                text: error
                                                                            }
                                                                        ],
                                                                        icon: {
                                                                            color: '#6b0500',
                                                                            icon: 'fas fa-x'
                                                                        },
                                                                        buttons: [
                                                                            {
                                                                                text: 'Close',
                                                                                action: 'close'
                                                                            }
                                                                        ]
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                                {
                                                    icon: 'fas fa-right-left',
                                                    tooltip: 'Premium Transfer',
                                                    onClick: function() {
                                                        modals.new({
                                                            type: 'form',
                                                            title: 'Enter your details',
                                                            description: [
                                                                {
                                                                    text: 'Input your <span>Roblox detail</span>, use your username or user ID below'
                                                                }
                                                            ],
                                                            inputs: [
                                                                {
                                                                    name: 'roblox',
                                                                    placeholder: 'Roblox detail',
                                                                    readonly: false,
                                                                },
                                                                {
                                                                    value: 'You will have to pay 1666 Robux',
                                                                    readonly: true
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Cancel',
                                                                    action: 'close'
                                                                },
                                                                {
                                                                    text: 'Submit',
                                                                    action: 'submit',
                                                                    close: true
                                                                }
                                                            ],
                                                            handler: async function(data) {
                                                                try {
                                                                    if (Object.keys(data).length) {
                                                                        data['product'] = 'transfer';
                                                                        let response = await prepared.robuxTopup(data);
                                                                        if (response.success) {
                                                                            modals.new({
                                                                                type: 'notification',
                                                                                title: 'Waiting for payment',
                                                                                description: [
                                                                                    {
                                                                                        text: 'Your order expiries in <span class="gradient-text">5 minutes</span>'
                                                                                    },
                                                                                    {
                                                                                        text: 'Please purchase the <span class="gradient-text">item</span> you will be redirected to in a moment and <span class="gradient-text">do not close this page</span>'
                                                                                    },
                                                                                    {
                                                                                        text: 'Click to copy and open the URL to your <span class="gradient-text">item</span> below'
                                                                                    },
                                                                                ],
                                                                                inputs: [
                                                                                    {
                                                                                        value: response['checkout'],
                                                                                        readonly: true,
                                                                                        onClick: function (value) { window.open(value, '_blank'); utilities.setClipboard(value) }
                                                                                    }
                                                                                ],
                                                                                icon: {
                                                                                    color: '#fcba2d',
                                                                                    icon: 'fas fa-clock-rotate-left'
                                                                                },
                                                                                buttons: [
                                                                                    {
                                                                                        text: 'Close',
                                                                                        action: 'close'
                                                                                    }
                                                                                ]
                                                                            });
                                                                            setTimeout(() => {
                                                                                window.open(response.checkout, '_blank');
                                                                                const end = Date.now() + 299000;
                                                                                const check = async () => {
                                                                                    if (Date.now() >= end) {
                                                                                        clearInterval(timer);
                                                                                        modals.new({
                                                                                            type: 'notification',
                                                                                            title: 'Purchase failed',
                                                                                            description: [
                                                                                                {
                                                                                                    text: `Your purchase of <span class="gradient-text">${data['product']}</span> for <span class="gradient-text">${data['roblox']}</span> has expired`
                                                                                                }
                                                                                            ],
                                                                                            icon: {
                                                                                                color: '#6b0500',
                                                                                                icon: 'fas fa-x'
                                                                                            },
                                                                                            buttons: [
                                                                                                {
                                                                                                    text: 'Close',
                                                                                                    action: 'close'
                                                                                                }
                                                                                            ]
                                                                                        });
                                                                                        return;
                                                                                    }
                                                                                    
                                                                                    const invoice = response['invoice'];
                                                                                    let check = await prepared.robuxCheck(invoice);
                                                                                    if (check.success) {
                                                                                        modals.new({
                                                                                            type: 'notification',
                                                                                            title: 'Order paid successfully',
                                                                                            description: [
                                                                                                {
                                                                                                    text: `A amount of <span class="gradient-text">$${check.amount}</span> has been added to your balance`
                                                                                                }
                                                                                            ],
                                                                                            icon: {
                                                                                                color: '#28a745',
                                                                                                icon: 'fas fa-check'
                                                                                            },
                                                                                            buttons: [
                                                                                                {
                                                                                                    text: 'Okay',
                                                                                                    action: 'close'
                                                                                                }
                                                                                            ]
                                                                                        });
                                                                                        clearInterval(timer);
                                                                                        await prepared.mobile(functions.updateMobile)
                                                                                    } else {
                                                                                        if (!check.message.includes('own')) {
                                                                                            modals.new({
                                                                                                type: 'notification',
                                                                                                title: `${check.message}`,
                                                                                                icon: {
                                                                                                    color: '#6b0500',
                                                                                                    icon: 'fas fa-x'
                                                                                                },
                                                                                                buttons: [
                                                                                                    {
                                                                                                        text: 'Close',
                                                                                                        action: 'close'
                                                                                                    }
                                                                                                ]
                                                                                            });
                                                                                            clearInterval(timer);
                                                                                        }
                                                                                    }
                                                                                }

                                                                                const timer = setInterval(check, 5000);
                                                                            }, 3000);
                                                                        } else {
                                                                            modals.new({
                                                                                type: 'notification',
                                                                                title: `${response.message}`,
                                                                                description: [
                                                                                    {
                                                                                        text: response.description
                                                                                    }
                                                                                ],
                                                                                icon: {
                                                                                    color: '#6b0500',
                                                                                    icon: 'fas fa-x'
                                                                                },
                                                                                buttons: [
                                                                                    {
                                                                                        text: 'Close',
                                                                                        action: 'close'
                                                                                    }
                                                                                ]
                                                                            });
                                                                        }
                                                                    } else {
                                                                        modals.new({
                                                                            type: 'notification',
                                                                            title: 'Missing fields',
                                                                            description: [
                                                                                {
                                                                                    text: 'Please fill out all fields and try again'
                                                                                }
                                                                            ],
                                                                            icon: {
                                                                                color: '#6b0500',
                                                                                icon: 'fas fa-x'
                                                                            },
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Close',
                                                                                    action: 'close'
                                                                                }
                                                                            ]
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    modals.new({
                                                                        type: 'notification',
                                                                        title: 'Error',
                                                                        description: [
                                                                            {
                                                                                text: 'Something went wrong during the top-up process'
                                                                            },
                                                                            {
                                                                                text: error
                                                                            }
                                                                        ],
                                                                        icon: {
                                                                            color: '#6b0500',
                                                                            icon: 'fas fa-x'
                                                                        },
                                                                        buttons: [
                                                                            {
                                                                                text: 'Close',
                                                                                action: 'close'
                                                                            }
                                                                        ]
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                            ],
                                            buttons: [
                                                {
                                                    text: 'Cancel',
                                                    action: 'close'
                                                },
                                            ],
                                        });
                                    }
                                },
                                {
                                    img: 'https://swagmode.net/assets/img/payments.png',
                                    onClick: function() {
                                        modals.new({
                                            type: 'choice',
                                            title: 'What would you like to purchase?',
                                            description: [
                                                {
                                                    text: 'Select your <span class="gradient-text">product</span> below'
                                                }
                                            ],
                                            choices: [
                                                {
                                                    icon: 'fas fa-star',
                                                    tooltip: 'SwagMode Premium',
                                                    onClick: function() {
                                                        modals.new({
                                                            type: 'form',
                                                            title: 'Enter your email address',
                                                            description: [
                                                                {
                                                                    text: 'Please enter your <span class="gradient-text">email address</span> below'
                                                                }
                                                            ],
                                                            inputs: [
                                                                {
                                                                    name: 'email',
                                                                    placeholder: 'Email Address',
                                                                    readonly: false,
                                                                },
                                                                {
                                                                    name: 'amount',
                                                                    value: 'You will have to pay $30 USD',
                                                                    readonly: true
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Cancel',
                                                                    action: 'close'
                                                                },
                                                                {
                                                                    text: 'Submit',
                                                                    action: 'submit',
                                                                    close: true
                                                                }
                                                            ],
                                                            handler: async function(data) {
                                                                try {
                                                                    if (Object.keys(data).length) {
                                                                        data['amount'] = data['amount'].match(/\$([0-9]+)/)[1];
                                                                        if (!isNaN((data['amount']))) {
                                                                            let response = await prepared.topup(data);
                                                                            if (response.success) {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invoice created',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Redirecting to <span class="gradient-text">checkout.sellix.io</span>'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#28a745',
                                                                                        icon: 'fas fa-check'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                                setTimeout(() => {
                                                                                    window.location.href = response.checkout;
                                                                                }, 600);
                                                                            } else {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: `${response.message}`,
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }
                                                                        } else {
                                                                            setTimeout(() => {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invalid amount',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Please enter an amount equal or over 10'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }, 300);
                                                                        }
                                                                    } else {
                                                                        modals.new({
                                                                            type: 'notification',
                                                                            title: 'Missing fields',
                                                                            description: [
                                                                                {
                                                                                    text: 'Please fill out all fields and try again'
                                                                                }
                                                                            ],
                                                                            icon: {
                                                                                color: '#6b0500',
                                                                                icon: 'fas fa-x'
                                                                            },
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Close',
                                                                                    action: 'close'
                                                                                }
                                                                            ]
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    modals.new({
                                                                        type: 'notification',
                                                                        title: 'Error',
                                                                        description: [
                                                                            {
                                                                                text: 'Something went wrong during the top-up process'
                                                                            }
                                                                        ],
                                                                        icon: {
                                                                            color: '#6b0500',
                                                                            icon: 'fas fa-x'
                                                                        },
                                                                        buttons: [
                                                                            {
                                                                                text: 'Close',
                                                                                action: 'close'
                                                                            }
                                                                        ]
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                                {
                                                    icon: 'fas fa-right-left',
                                                    tooltip: 'Premium Transfer',
                                                    onClick: function() {
                                                        modals.new({
                                                            type: 'form',
                                                            title: 'Enter your email address',
                                                            description: [
                                                                {
                                                                    text: 'Please enter your <span class="gradient-text">email address</span> below'
                                                                }
                                                            ],
                                                            inputs: [
                                                                {
                                                                    name: 'email',
                                                                    placeholder: 'Email Address',
                                                                    readonly: false,
                                                                },
                                                                {
                                                                    name: 'amount',
                                                                    value: 'You will have to pay $10 USD',
                                                                    readonly: true
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Cancel',
                                                                    action: 'close'
                                                                },
                                                                {
                                                                    text: 'Submit',
                                                                    action: 'submit',
                                                                    close: true
                                                                }
                                                            ],
                                                            handler: async function(data) {
                                                                try {
                                                                    if (Object.keys(data).length) {
                                                                        data['amount'] = data['amount'].match(/\$([0-9]+)/)[1];
                                                                        if (!isNaN((data['amount']))) {
                                                                            let response = await prepared.topup(data);
                                                                            if (response.success) {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invoice created',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Redirecting to <span class="gradient-text">checkout.sellix.io</span>'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#28a745',
                                                                                        icon: 'fas fa-check'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                                setTimeout(() => {
                                                                                    window.location.href = response.checkout;
                                                                                }, 600);
                                                                            } else {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: `${response.message}`,
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }
                                                                        } else {
                                                                            setTimeout(() => {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invalid amount',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Please enter an amount equal or over 10'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }, 300);
                                                                        }
                                                                    } else {
                                                                        modals.new({
                                                                            type: 'notification',
                                                                            title: 'Missing fields',
                                                                            description: [
                                                                                {
                                                                                    text: 'Please fill out all fields and try again'
                                                                                }
                                                                            ],
                                                                            icon: {
                                                                                color: '#6b0500',
                                                                                icon: 'fas fa-x'
                                                                            },
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Close',
                                                                                    action: 'close'
                                                                                }
                                                                            ]
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    modals.new({
                                                                        type: 'notification',
                                                                        title: 'Error',
                                                                        description: [
                                                                            {
                                                                                text: 'Something went wrong during the top-up process'
                                                                            }
                                                                        ],
                                                                        icon: {
                                                                            color: '#6b0500',
                                                                            icon: 'fas fa-x'
                                                                        },
                                                                        buttons: [
                                                                            {
                                                                                text: 'Close',
                                                                                action: 'close'
                                                                            }
                                                                        ]
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                                {
                                                    icon: 'fas fa-comments-dollar',
                                                    tooltip: 'Custom amount',
                                                    onClick: function() {
                                                        modals.new({
                                                            type: 'form',
                                                            title: 'Enter your email address',
                                                            description: [
                                                                {
                                                                    text: 'Please enter your <span class="gradient-text">email address</span> below'
                                                                }
                                                            ],
                                                            inputs: [
                                                                {
                                                                    name: 'email',
                                                                    placeholder: 'Email Address',
                                                                    readonly: false,
                                                                },
                                                                {
                                                                    name: 'amount',
                                                                    placeholder: 'Amount of USD e.g. 100',
                                                                    readonly: false,
                                                                    event: function(value) {
                                                                        $(this).val(value.replace(/[^0-9$]/g, ''));
                                                                    }
                                                                }
                                                            ],
                                                            buttons: [
                                                                {
                                                                    text: 'Cancel',
                                                                    action: 'close'
                                                                },
                                                                {
                                                                    text: 'Submit',
                                                                    action: 'submit',
                                                                    close: false
                                                                }
                                                            ],
                                                            handler: async function(data) {
                                                                try {
                                                                    if (Object.keys(data).length) {
                                                                        if (!isNaN((data['amount']))) {
                                                                            let response = await prepared.topup(data);
                                                                            if (response.success) {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invoice created',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Redirecting to <span class="gradient-text">checkout.sellix.io</span>'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#28a745',
                                                                                        icon: 'fas fa-check'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                                setTimeout(() => {
                                                                                    window.location.href = response.checkout;
                                                                                }, 600);
                                                                            } else {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: `${response.message}`,
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }
                                                                        } else {
                                                                            setTimeout(() => {
                                                                                modals.new({
                                                                                    type: 'notification',
                                                                                    title: 'Invalid amount',
                                                                                    description: [
                                                                                        {
                                                                                            text: 'Please enter an amount equal or over 10'
                                                                                        }
                                                                                    ],
                                                                                    icon: {
                                                                                        color: '#6b0500',
                                                                                        icon: 'fas fa-x'
                                                                                    },
                                                                                    buttons: [
                                                                                        {
                                                                                            text: 'Close',
                                                                                            action: 'close'
                                                                                        }
                                                                                    ]
                                                                                });
                                                                            }, 300);
                                                                        }
                                                                    } else {
                                                                        modals.new({
                                                                            type: 'notification',
                                                                            title: 'Missing fields',
                                                                            description: [
                                                                                {
                                                                                    text: 'Please fill out all fields and try again'
                                                                                }
                                                                            ],
                                                                            icon: {
                                                                                color: '#6b0500',
                                                                                icon: 'fas fa-x'
                                                                            },
                                                                            buttons: [
                                                                                {
                                                                                    text: 'Close',
                                                                                    action: 'close'
                                                                                }
                                                                            ]
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    modals.new({
                                                                        type: 'notification',
                                                                        title: 'Error',
                                                                        description: [
                                                                            {
                                                                                text: 'Something went wrong during the top-up process'
                                                                            }
                                                                        ],
                                                                        icon: {
                                                                            color: '#6b0500',
                                                                            icon: 'fas fa-x'
                                                                        },
                                                                        buttons: [
                                                                            {
                                                                                text: 'Close',
                                                                                action: 'close'
                                                                            }
                                                                        ]
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            ],
                                            buttons: [
                                                {
                                                    text: 'Cancel',
                                                    action: 'close'
                                                },
                                            ],
                                        });
                                    }
                                }
                            ],
                            buttons: [
                                {
                                    text: 'Cancel',
                                    action: 'close'
                                }
                            ]
                        });
                        break;
                    case 'verify':
                        modals.new({
                            type: 'form',
                            title: 'Connect a new Roblox account',
                            description: [
                                {
                                    text: 'Input your <span>Roblox detail</span>, use your username or user ID below'
                                }
                            ],
                            inputs: [
                                {
                                    name: 'roblox',
                                    placeholder: 'Roblox detail',
                                    readonly: false,
                                }
                            ],
                            buttons: [
                                {
                                    text: 'Cancel',
                                    action: 'close'
                                },
                                {
                                    text: 'Submit',
                                    action: 'submit',
                                    close: true
                                }
                            ],
                            handler: async function(data) {
                                try {
                                    if (Object.keys(data).length) {
                                        let response = await prepared.start(data);
                                        if (response.success) {
                                            modals.new({
                                                type: 'notification',
                                                title: 'Verification started',
                                                description: [
                                                    {
                                                        text: 'Verification code expiries in <span class="gradient-text">5 minutes</span>'
                                                    },
                                                    {
                                                        text: 'Click to copy the code from below this message and add it to your Roblox profile\'s description'
                                                    }
                                                ],
                                                icon: {
                                                    color: '#fcba2d',
                                                    icon: 'fas fa-clock-rotate-left'
                                                },
                                                inputs: [
                                                    {
                                                        value: response['code'],
                                                        readonly: true,
                                                        onClick: function (value) { utilities.setClipboard(value); }
                                                    }
                                                ],
                                                buttons: [
                                                    {
                                                        text: 'Close',
                                                        action: 'close'
                                                    }
                                                ]
                                            });
                                            const end = Date.now() + 299000;
                                            const check = async () => {
                                                if (Date.now() >= end) {
                                                    clearInterval(timer);
                                                    modals.new({
                                                        type: 'notification',
                                                        title: 'Verification Failed',
                                                        description: [
                                                            {
                                                                text: `Your verification code for <span class="gradient-text">${data['roblox']}</span> has expired`
                                                            }
                                                        ],
                                                        icon: {
                                                            color: '#6b0500',
                                                            icon: 'fas fa-x'
                                                        },
                                                        buttons: [
                                                            {
                                                                text: 'Close',
                                                                action: 'close'
                                                            }
                                                        ]
                                                    });
                                                    return;
                                                }
                                                
                                                const code = response['code'];
                                                let check = await prepared.check(code);
                                                if (check.success) {
                                                    modals.new({
                                                        type: 'notification',
                                                        title: 'Account connected successfully',
                                                        description: [
                                                            {
                                                                text: 'You have verified the ownership of your account'
                                                            }
                                                        ],
                                                        icon: {
                                                            color: '#28a745',
                                                            icon: 'fas fa-check'
                                                        },
                                                        buttons: [
                                                            {
                                                                text: 'Okay',
                                                                action: 'close'
                                                            }
                                                        ]
                                                    });
                                                    clearInterval(timer);
                                                    const primary = await prepared.primary(null, functions.updatePrimary);
                                                    await prepared.whitelists(true, functions.updateWhitelists);
                                                    await prepared.verifications(primary['roblox']?.['id'] ?? null, functions.updateVerifications);
                                                } else {
                                                    if (!check.message.includes('Roblox')) {
                                                        modals.new({
                                                            type: 'notification',
                                                            title: `${check.message}`,
                                                            icon: {
                                                                color: '#6b0500',
                                                                icon: 'fas fa-x'
                                                            },
                                                            buttons: [
                                                                {
                                                                    text: 'Close',
                                                                    action: 'close'
                                                                }
                                                            ]
                                                        });
                                                        clearInterval(timer);
                                                    }
                                                }
                                            }

                                            const timer = setInterval(check, 5000);
                                        } else {
                                            modals.new({
                                                type: 'notification',
                                                title: `${response.message}`,
                                                icon: {
                                                    color: '#6b0500',
                                                    icon: 'fas fa-x'
                                                },
                                                buttons: [
                                                    {
                                                        text: 'Close',
                                                        action: 'close'
                                                    }
                                                ]
                                            });
                                        }
                                    } else {
                                        modals.new({
                                            type: 'notification',
                                            title: 'Missing fields',
                                            description: [
                                                {
                                                    text: 'Please fill out all fields and try again'
                                                }
                                            ],
                                            icon: {
                                                color: '#6b0500',
                                                icon: 'fas fa-x'
                                            },
                                            buttons: [
                                                {
                                                    text: 'Close',
                                                    action: 'close'
                                                }
                                            ]
                                        });
                                    }
                                } catch (error) {
                                    modals.new({
                                        type: 'notification',
                                        title: 'Error',
                                        description: [
                                            {
                                                text: 'Something went wrong during the verification process'
                                            }
                                        ],
                                        icon: {
                                            color: '#6b0500',
                                            icon: 'fas fa-x'
                                        },
                                        buttons: [
                                            {
                                                text: 'Close',
                                                action: 'close'
                                            }
                                        ]
                                    });
                                }
                            }
                        });
                        break;
                    case 'transfer':
                        modals.new({
                            type: 'form',
                            title: `Transfer ${id}?`,
                            description: [
                                {
                                    text: 'This action will cost you <span class="gradient-text">$10</span>'
                                },
                                {
                                    text: `Input your <span>Roblox detail</span>, use your username or user ID below`
                                }
                            ],
                            icon: {
                                icon: 'fas fa-right-left'
                            },
                            inputs: [
                                {
                                    value: `Transferring ${id}`,
                                    name: 'old_roblox',
                                    readonly: true,
                                },
                                {
                                    name: 'new_roblox',
                                    placeholder: 'Roblox detail',
                                    readonly: false,
                                }
                            ],
                            buttons: [
                                {
                                    text: 'Cancel',
                                    action: 'close',
                                },
                                {
                                    text: 'Transfer',
                                    action: 'submit'
                                }
                            ],
                            handler: async function(data) {
                                let response = await prepared.transfer(id, data['new_roblox']);
                                if (response.success) {
                                    modals.new({
                                        type: 'notification',
                                        title: 'Transfer successful',
                                        description: [
                                            {
                                                text: 'Premium transfer completed successfully'
                                            }
                                        ],
                                        icon: {
                                            color: '#28a745',
                                            icon: 'fas fa-check'
                                        },
                                        buttons: [
                                            {
                                                text: 'Okay',
                                                action: 'close'
                                            }
                                        ]
                                    });
                                    await prepared.mobile(functions.updateMobile)
                                    const primary = await prepared.primary(null, functions.updatePrimary);
                                    await prepared.whitelists(true, functions.updateWhitelists);
                                    await prepared.verifications(primary['roblox']?.['id'] ?? null, functions.updateVerifications);
                                } else {
                                    modals.new({
                                        type: 'notification',
                                        title: response.message,
                                        description: [
                                            {
                                                text: response.description
                                            }
                                        ],
                                        icon: {
                                            color: '#6b0500',
                                            icon: 'fas fa-x'
                                        },
                                        buttons: [
                                            {
                                                text: 'Okay',
                                                action: 'close'
                                            }
                                        ]
                                    });
                                }
                            }
                        });
                        break;
                    case 'whitelist':
                        modals.new({
                            type: 'notification',
                            title: `Whitelist ${id}?`,
                            description: [
                                {
                                    text:'This action will cost you <span class="gradient-text">$30</span>'
                                },
                                {
                                    text: `Are you sure you want to continue?`
                                }
                            ],
                            icon: {
                                icon: 'fas fa-circle-exclamation'
                            },
                            buttons: [
                                {
                                    text: 'No',
                                    action: 'close',
                                },
                                {
                                    text: 'Yes',
                                    action: 'close',
                                    onClick: async function() {
                                        let response = await prepared.whitelist(id);
                                        if (response.success) {
                                            modals.new({
                                                type: 'notification',
                                                title: 'Purchase successful',
                                                description: [
                                                    {
                                                        text: 'Your account was whitelisted successfully'
                                                    }
                                                ],
                                                icon: {
                                                    color: '#28a745',
                                                    icon: 'fas fa-check'
                                                },
                                                buttons: [
                                                    {
                                                        text: 'Okay',
                                                        action: 'close'
                                                    }
                                                ]
                                            });
                                            await prepared.mobile(functions.updateMobile)
                                            const primary = await prepared.primary(null, functions.updatePrimary);
                                            await prepared.whitelists(true, functions.updateWhitelists);
                                            await prepared.verifications(primary['roblox']?.['id'] ?? null, functions.updateVerifications);
                                        } else {
                                            modals.new({
                                                type: 'notification',
                                                title: response.message,
                                                description: [
                                                    {
                                                        text: response.description
                                                    }
                                                ],
                                                icon: {
                                                    color: '#6b0500',
                                                    icon: 'fas fa-x'
                                                },
                                                buttons: [
                                                    {
                                                        text: 'Okay',
                                                        action: 'close'
                                                    }
                                                ]
                                            });
                                        }
                                    }
                                }
                            ]
                        });
                        break;
                    case 'primary':
                        prepared.primary(id, functions.updatePrimary);
                        prepared.verifications(id, functions.updateVerifications);
                        break;
                    case 'purchase':
                        const response = await requests.get('api/users/mobile');
                        const authorized = response['success'] ?? false;
                        if (authorized) {
                            window.location.href = 'account';
                        } else {
                            modals.new({
                                type: 'notification',
                                title: 'Authorize to continue',
                                description: [
                                    {
                                        text: 'You\'re able to manage all your Premium accounts at <a class="gradient-text" href="account">swagmode.net/account</a>'
                                    }
                                ],
                                icon: {
                                    color: '#5865fd99',
                                    icon: 'fab fa-discord'
                                },
                                buttons: [
                                    {
                                        text: 'Close',
                                        action: 'close'
                                    },
                                    {
                                        text: 'Authorize',
                                        onClick: function() {
                                            window.location.href = 'account'
                                        }
                                    }
                                ]
                            });
                        }
                        break;
                    default:
                        console.log('Unknown action');
                        break;
                }
            }
        });        
        $('.faq-box').click(function() {
            $('.faq-box').not(this).removeClass('expanded').find('i').removeClass('fa-minus').addClass('fa-plus');
            $(this).toggleClass('expanded');
            $(this).find('i').toggleClass('fa-plus fa-minus');
        });
        $('.toggle').click(function() {
            $(this).toggleClass('active');
            var navigation = $('.mobile');
            
            if (navigation.hasClass('active')) {
                navigation.removeClass('active').addClass('hidden');
            } else {
                navigation.removeClass('hidden').addClass('active').css('display', 'flex');
            }
        });
    }
}

const utilities = {
    setClipboard: function(value) {
        navigator.clipboard.writeText(value);
    }
}

const functions = {
    updateMobile: (data) => {
        if (data['success']) {
        const $balance = $('#balance');
            if (data.user.balance) {
                $balance.text(data.user.balance);
            } else {
                $balance.text('$0.00');
            }
        }
    },
    updatePrimary: async (data) => {
        const $elements = $('#primary');
    
        if (data && data['roblox'] && data['roblox'].name && data['roblox'].id && data['roblox'].headshot) {
            $elements.empty();
    
            const $div = $('<div class="card"></div>');
    
            $div.append(
                $('<div class="connections-headshot"></div>')
                    .append($('<img draggable="false">').attr('src', `${data['roblox'].headshot}`))
            );                    
            $div.append(
                $('<div class="connections-details"></div>').append(
                    $('<div class="gradient-text connections-username"></div>').text(data['roblox'].name),
                    $('<div class="connections-id"></div>').append(
                        $('<code></code>').text(data['roblox'].id)
                    )
                )
            );
    
            $elements.append($div);
        } else {
            $elements.empty().append('<div class="card-text-small">No Primary account set</div>');
        }
    },            
    updateVerifications: async (id = null, data) => {
        const $elements = $('#verifications');
    
        if (data) {
            try {
                let all = await prepared.whitelists(false);
                let whitelists = all['whitelists'] ?? [];
    
                $elements.empty();
    
                data['verifications'].forEach(account => {
                    const $div = $('<div class="card"></div>');
                    $div.append(
                        $('<div class="connections-headshot"></div>')
                            .append($('<img draggable="false">').attr('src', `${account.headshot}`))
                    );
                    $div.append(
                        $('<div class="connections-details"></div>').append(
                            $('<div class="gradient-text connections-username"></div>').text(account.name),
                            $('<div class="connections-id"></div>').append(
                                $('<code></code>').text(account.id)
                            )
                        )
                    );
    
                    const $buttons = $('<div class="connections-buttons"></div>');
    
                    if (id !== account.id) {
                        $buttons.append(
                            $(`<button class='small-tooltip' data-do='primary' data-id='${account.id}' tooltip='Set as Primary'></button>`).append(
                                $('<i class="gradient-icon fas fa-thumbtack fa-rotate-by" style="--fa-rotate-angle: 45deg;"></i>')
                            )
                        );
                    }
    
                    if (!whitelists.includes(account.id)) {
                        $buttons.append(
                            $(`<button class='small-tooltip' data-do='whitelist' data-id='${account.id}' tooltip='Purchase Whitelist'></button>`).append(
                                $('<i class="gradient-icon fas fa-star"></i>')
                            )
                        );
                    }
    
                    if ($buttons.children().length > 0) {
                        $div.append($buttons);
                    }
                    $elements.append($div);
                });
            } catch (error) {
                console.error('Error updating verifications:', error);
                $elements.empty().append('<div class="card-text-small" data-aos="fade-up">Error loading verifications</div>');
            }
        } else {
            $elements.empty().append('<div class="card-text-small" data-aos="fade-up">No connected accounts</div>');
        }
    },                      
    updateWhitelists: async (data) => {
        const $elements = $('#whitelists');
    
        if (data && data['whitelists']) {
            try {
                $elements.empty();
                let hasAccounts = false;
    
                let all = await prepared.whitelists(false);
                let whitelists = all['whitelists'] ?? [];
    
                data['whitelists'].forEach(account => {
                    const $div = $('<div class="card"></div>');
                    $div.append(
                        $('<div class="connections-headshot"></div>')
                            .append($('<img draggable="false">').attr('src', `${account.headshot}`))
                    );
                    $div.append(
                        $('<div class="connections-details"></div>').append(
                            $('<div class="gradient-text connections-username"></div>').text(account.name),
                            $('<div class="connections-id"></div>').append(
                                $('<code></code>').text(account.id)
                            )
                        )
                    );
    
                    const $buttons = $('<div class="connections-buttons"></div>');
    
                    $buttons.append(
                        $(`<button class='small-tooltip' data-do='transfer' data-id='${account.id}' tooltip='Transfer whitelist'></button>`).append(
                            $('<i class="gradient-icon fas fa-right-left"></i>')
                        )
                    );
                    if ($buttons.children().length > 0) {
                        $div.append($buttons);
                    }
                    $elements.append($div);
                    hasAccounts = true;
                });
    
                if (!hasAccounts) {
                    $elements.empty().append('<div class="card-text-small" data-aos="fade-up">No Premium accounts</div>');
                }
    
            } catch (error) {
                console.error('Error updating whitelists:', error);
                $elements.empty().append('<div class="card-text-small" data-aos="fade-up">Error loading whitelists</div>');
            }
        } else {
            $elements.empty().append('<div class="card-text-small" data-aos="fade-up">No Premium accounts</div>');
        }
    }
}

const inits = {
    init: function() {
        aos.init();
        buttons.init();
        burger.init();
    }
}

const sometimes = {
    init: function() {
        setInterval(async () => {
            const mobile = await prepared.mobile(functions.updateMobile);
            const authorized = mobile['success'] ?? false;
            if (!authorized) {
                window.location.href = '/';
            }
        }, 10000);
    }
}

const prepared = {
    mobile: async (callback = null) => {
        try {
            const response = await requests.get('api/users/mobile');
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in mobile:', error);
        }
    },
    topup: async (data, callback = null) => {
        try {
            const response = await requests.post('api/payments/create', data);
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in topup:', error);
        }
    },
    robuxTopup: async (data, callback = null) => {
        try {
            const response = await requests.post('api/roblox/create', data);
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in topup:', error);
        }
    },
    primary: async (id = null, callback = null) => {
        try {
            let response;
            if (id) {
                response = await requests.post(`api/users/primary`, {'roblox': id});
            } else {
                response = await requests.get(`api/users/primary`);
            }
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in primary:', error);
        }
    },
    whitelists: async (self = true, callback = null) => {
        try {
            let response;
            if (self) {
                response = await requests.get(`api/whitelists/whitelists`, {'self' : 'true'});
            } else {
                response = await requests.get(`api/whitelists/whitelists`);
            }
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in whitelists:', error);
        }
    },
    verifications: async (id = null, callback = null) => {
        try {
            const response = await requests.get(`api/verifications/get`);
            if (typeof callback === 'function') {
                callback(id, response);
            }
            return response;
        } catch (error) {
            console.error('Error in verifications:', error);
        }
    },
    transfer: async (old_id, new_id, callback = null) => {
        try {
            const response = await requests.post(`api/whitelists/transfer`, {'old_roblox': old_id, 'new_roblox': new_id});
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in transfer:', error);
        }
    },
    whitelist: async (id, callback = null) => {
        try {
            const response = await requests.post(`api/whitelists/whitelist`, {'roblox': id});
            if (typeof callback === 'function') {
                callback(id, response);
            }
            return response;
        } catch (error) {
            console.error('Error in whitelist:', error);
        }
    },
    start: async (data, callback = null) => {
        try {
            const response = await requests.post('api/verifications/start', data);
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in start:', error);
        }
    },
    check: async (code, callback = null) => {
        try {
            const response = await requests.get(`api/verifications/check?code=${code}`);
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in check:', error);
        }
    },
    robuxCheck: async (code, callback = null) => {
        try {
            const response = await requests.get(`api/roblox/check?invoice=${code}`);
            if (typeof callback === 'function') {
                callback(response);
            }
            return response;
        } catch (error) {
            console.error('Error in check:', error);
        }
    }
}

const burger = {
    init: function() {
        $('.mobile').on('animationend', function() {
            if ($(this).hasClass('hidden')) {
                $(this).css('display', 'none');
            }
        });
    }
}

const init = {
    main: async function() {
        try {
            const mobile = await prepared.mobile(functions.updateMobile);
            const authorized = mobile['success'] ?? false;
            if (authorized) {

            } else {

            }
        } catch (error) {
            
        }
    },
    account: async function() {
        try {
            sometimes.init();
            const mobile = await prepared.mobile(functions.updateMobile);
            const authorized = mobile['success'] ?? false;
            if (authorized) {
                const primary = await prepared.primary(null, functions.updatePrimary);
                await prepared.whitelists(true, functions.updateWhitelists);
                await prepared.verifications(primary['roblox']?.['id'] ?? null, functions.updateVerifications);
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error in account init:', error);
        }
    }
};

$(document).ready(async function () {
    const path = window.location.pathname.replace(/^\/|\/$/g, '').split('/').pop();
    await start.for(path);
});
