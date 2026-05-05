import os
import subprocess
import json

screens = [
    {
        "name": "Welcome",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2VhMDczMDkzN2VhZTRlOWY4NzQ1MDFhNzZiYzM5YjM2EgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0uhxnLPblvWwzRbC-v2vExcgHyhqMEJfx4lIdyIEpaMgVXcPK1whW1B_YFesWaYMF94ULT6VPyN4AZM7tccK8Kf6YVqORL65XTiHMRGRsZYbcAr7YpkU9cA7ZT3YGKDFLY8O6ZYFvBox2m41dOneBGse5_rM7bpff0utWgPVWS9ceHTEiyY3zjpSGfRFOqZlVIsVw5bMHqzzYowVAaGM5HPxYp5erMzOV7SevFGWRmo8WzKfk6h1DriRzyk"
    },
    {
        "name": "Login",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzgyYTIyYTI3OTdjNjRlNDBiNGQwZTA0YmRlMjFiYzdmEgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0uiAQtMZD1x8oEpgYNt7mNHa8vQbiGyzYVCPhH1iylkAFjtcUuhJymmCPo8xb-aN_XrQyyZR8SXpoVsgCCF3s3fIH1pXa5dXdjd-0kt2C55x-FEskolqNa5pR0TYvUJgawmX02uqg0SK2eOc00u6lTZ__N-7C6Zd4gC3l4yBPegJNLLDuk4tFIzNB3Fumip2e4Hnhs3ZubsDKFhaGpSCd3MpeX0rEYH3lC4pAPYptP1paHnsLJl-pNXLPKxT"
    },
    {
        "name": "Dashboard",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MwMzVhYWM3MDA5MjRlN2JiY2MyNTYxNGE3ZDQwZTA3EgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0ugFL4y_Fz5CbZ2hYjKdgp5CX8xvVn2f2DW6gPjpXDPtrZEWu-vMZ2mcKCX1kMtclMO1klxWyJdySS6gwgVPbdM1Heve68utcJ1ud56zc61B74gYe_ygu4MxRa1t3JdQgh4TthTgL2JYVuvr7AaKwQl4JNDsLvtVMu6v3W9-DHHdjoIW_ABZHPErYXxBgJmrOrE09js0yVgbHR0fhqz1SAf1YyhubR51IqNt6nga4MXz1pf7KsNjr-0K8ZzB"
    },
    {
        "name": "Task_Details",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzZhN2I4ZTZhNWRkYTRjNzI4NzA0YjVhZmExZjRiNDI4EgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0ugseX9A0jgRNDrPAT_12b0Akf9VN8H1kYUcDJ9M0ykMNriMEGgIdU3_Um14EC_43ihsDHtDmLrg08RrvKmrPKwu_QJ9BmzJTv0zYk727nEbmUKk2jTpjsAL7D7t50ZB-dv65HCysMLPpjmx-6oMmujVGCtVRGQWk7ykGKwIXbulYWXFdpft_RjaQL2VxH6SB5Mpov-a3rXvFMf_rPP7cXiIv9SSTGM-i2X6UWNgtphCsuRdUiMsNuYkGDU"
    },
    {
        "name": "Your_Journey",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI2YWM4YWQzZDM4NTQ3MTNiMTc3NDFiZWY3MzVlOWRiEgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0uhb7-E0XHchTqq_zXelJZN_KuD1b44AFwtT8nKEVw8wgl7f7uIkj27lvqtTbJCr3bZWtFovGDgUkpwwPW9qXe6xm7dj9x5AJUzJSGC27uhMU7FQJWZpRyGg2g9dMCeRjBhRTY2n6f1aJO5VuThkKa0rUr7rBnF4tyyJ17B0nZqht9vQlwCEvvbWMUddSEcPqX_L1DoUNZIolvNVv1quVOt1ZGdAFSYfW0g6ahuKyvJXECU8aFeAKTIHjg1F"
    },
    {
        "name": "Meet_the_Team",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVhYjAwMjk4YjJjYTRkNDdiNjI3NWFkNzJmNTBmZmZhEgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0ujNOtEyEdOEz7cXfYgigsAFin5zd0O6KUGX6L3_RVKaFDAv5D9oAcGdLW5LM8QrtlSkdGfYoawpafpDHYNcPvKBls5uAVfudHZQSDD1GZaGu1Ld0sUJpYkcX4IMhlE7eXc2yrUlUUcPjK7NaPqORPuc6bAFAaBU56yMFMa-bRGWFgk0-kpqnp_xRFfQVwuh147xuCvIUHTSCc9PeSBc34OqHz7w2W5k7-0NWqn6LyV7kcBfcIVKf4M-Sir-"
    },
    {
        "name": "FAQs",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVhZjg4ZGNkZmZiOTQyYTc4ZTA3N2U5NzVmZmU4NDQ5EgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0ugdTLLUb17wqXLsXWX-uIGnYY1RFO7eRjPqzUC44I-_K7bAsfa2-fxLaOB9uN6IU0MNNSUF3IFJLJ54gs7ieMko5iUB1oP-MoAX7gxxeK44ZZJjRikOAKvuHYqoXvAv0fe8OUHcI5_i5UBu_IdxL8kIDCvO_utOOGZyvZBs3XduUasdEB-87mRHBrljSn-jnnRDj33vShWtmBhdsJKTZBoPvwAv6fkr15XSjw71UIIlTNG_WaV0El30kgFn"
    },
    {
        "name": "Profile",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA1ZDEzMWY0YmU5ZTRlZmViMTAyOTEwMDQxZDM0MDVkEgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0uhyW5vg2h4Fx7VO4MINYhJffsbRau82X4Sea_dBoE-EtW2bonQNjZV6VCmXRggYCn17C8BliwlwH37kPGzZAOnvNlFSrVluBN6l_V0taKwDzTTKRqrJDt00cquueMMo527_2CIXmZaiAS05uKfXcAwDsL8NcuqLqxeZCGLTmizcm3WgzpC8nay5ibL5PzYccLkxrixtPCIO4NpaAXjk24_NjrjD3HAJcbelgg7aEO62_6Zsp3ol6DaUvEPL"
    },
    {
        "name": "Ask_Concierge",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2RmYjMyZWY4NTFhMDRmZGNhNDA2ZmJmYmI4Mzk4NWJiEgsSBxD8qY20mBcYAZIBJAoKcHJvamVjdF9pZBIWQhQxMzIzNjYwNjE5NTg5MzExNjIwMA&filename=&opi=89354086",
        "img_url": "https://lh3.googleusercontent.com/aida/ADBb0uhZaeOAt9S4SyKrNPev47wbmLegqjt0TQvp8lasrwpDHfzieH1i93DPNpmL3oXlfKbPwkfC1HVdLwKHdYqIvJbz3fAfoBd-7E8NqEl7Tczo1NJiV7eWP2F8hyPPXkeHd5BAoppClqiFvqdLOrBagdYmMMPd_PvCp6GtT1EEz2nR0RiFQo8qQ-lbdn_A9H8qjzSDkbVDpuRJy3yS0XUtr5ab33jZPxKLVVBoGQHo_a3vmnqvRId1-ZErW0k"
    }
]

out_dir = "screens_export"
os.makedirs(out_dir, exist_ok=True)

for sc in screens:
    name = sc['name']
    html_f = os.path.join(out_dir, f"{name}.html")
    img_f = os.path.join(out_dir, f"{name}.png")
    
    print(f"Downloading {name} html...")
    subprocess.run(["curl.exe", "-L", "-s", sc['html_url'], "-o", html_f])
    
    print(f"Downloading {name} img...")
    subprocess.run(["curl.exe", "-L", "-s", sc['img_url'], "-o", img_f])

print("Done!")
