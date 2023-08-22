// --------------------------------------------------------------
// Register page frontend code.
// --------------------------------------------------------------

import NavBar from '../components/NavBar'
import ToolBar from '../components/ToolBar'
import Footer from '../components/Footer'
import React from 'react'
import { Button, Checkbox, Form, Input } from 'antd'
import ReCAPTCHA from 'react-google-recaptcha'
import { registerUser  } from '../../firebase'

function Register() {
    const [form] = Form.useForm()
    const RECAPTCHA_SITE_KEY = '6Le6Gr8nAAAAAGx8Htz6PZevCsT0p4nXcObacrEB'
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    }
    
    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
        },
    }

    const onFinish = (values: any) => {
        registerUser(values.email, values.password, values.fullname)
    }

    return (
        <div id="register-body">
            <ToolBar user={null} />
            <div id="register-content">
                <NavBar />
                <div id="register-main">
                    <div id="register-main-content">
                        <Form
                            {...formItemLayout}
                            form={form}
                            name="register"
                            onFinish={onFinish}
                            style={{ maxWidth: 600 }}
                            scrollToFirstError
                        >
                            <h2 style={{ textAlign: 'center' }}>Register</h2>
                            <Form.Item
                                name="fullname"
                                label="Full Name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your full name!',
                                        whitespace: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label="E-mail"
                                rules={[
                                    {
                                        type: 'email',
                                        message:
                                            'The input is not valid E-mail!',
                                    },
                                    {
                                        required: true,
                                        message: 'Please input your E-mail!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                                hasFeedback
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="confirm"
                                label="Confirm Password"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Please confirm your password!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue('password') ===
                                                    value
                                            ) {
                                                return Promise.resolve()
                                            }
                                            return Promise.reject(
                                                new Error(
                                                    'The new password that you entered do not match!'
                                                )
                                            )
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item
                                name="agreement"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value
                                                ? Promise.resolve()
                                                : Promise.reject(
                                                      new Error(
                                                          'Should accept agreement'
                                                      )
                                                  ),
                                    },
                                ]}
                                {...tailFormItemLayout}
                            >
                                <Checkbox>
                                    I have read and agree to the
                                    <a href="/terms-and-conditions">
                                        {' '}
                                        terms and conditions
                                    </a>
                                </Checkbox>
                            </Form.Item>
                            <ReCAPTCHA
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    userSelect: 'none',
                                }}
                                sitekey={RECAPTCHA_SITE_KEY}
                            />

                            <Form.Item {...tailFormItemLayout}>
                                <Button type="primary" htmlType="submit">
                                    Register
                                </Button>
                                <div
                                    style={{
                                        marginTop: 16,
                                        textAlign: 'center',
                                    }}
                                >
                                    Already have an account?
                                    <a href="/login"> Login</a>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Register
