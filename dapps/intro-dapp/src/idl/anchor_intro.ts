/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_intro.json`.
 */
export type AnchorIntro = {
  "address": "CUkzBSEdfAxfCLH1kAXLdjWhtcWRyf89ExsukP3VSgCZ",
  "metadata": {
    "name": "anchorIntro",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteBio",
      "discriminator": [
        194,
        242,
        73,
        44,
        249,
        19,
        229,
        185
      ],
      "accounts": [
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "introAcc",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initIntro",
      "discriminator": [
        199,
        170,
        153,
        85,
        244,
        173,
        55,
        112
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "introAcc",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  114,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateIntro",
      "discriminator": [
        143,
        69,
        148,
        242,
        60,
        237,
        197,
        171
      ],
      "accounts": [
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "introAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  116,
                  114,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newBio",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "intro",
      "discriminator": [
        141,
        110,
        63,
        51,
        218,
        219,
        204,
        85
      ]
    }
  ],
  "types": [
    {
      "name": "intro",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bio",
            "type": "string"
          }
        ]
      }
    }
  ]
};
