# BiomeJS 配置示例

自用的 BiomeJS。

BiomeJS 更简便

## 普通 BiomeJS 配置

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    // 使用 .gitignore 文件来忽略文件
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    // 使用空格进行缩进
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      // 对 any 类型的使用发出警告
      "suspicious": {
        "noExplicitAny": "warn",
        "useAwait": "warn",
        // 不准出现 var
        "noVar": "warn"
      },
      "style": {
        // 应当使用 const
        "useConst": "warn",
        // 推荐使用 for...of 而不是传统的 for 循环
        "useForOf": "error"
      },
      "correctness": {
        // 强制 JSDoc 注释行以单个星号开头，第一个除外。
        "useSingleJsDocAsterisk": "error",
        // 未使用的变量发出警告，但是允许使用 _ 开头的变量名来表示未使用
        "noUnusedVariables": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      // 使用双引号
      "quoteStyle": "double",
      // 在 JSX 中也使用双引号
      "jsxQuoteStyle": "double",
      // 对象和数组的最后一个元素后面添加逗号
      "trailingCommas": "all",
      // 语句末尾总是添加分号
      "semicolons": "always",
      // 箭头函数始终使用括号包裹参数
      "arrowParentheses": "always"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        // 自动组织导入
        "organizeImports": "on"
      }
    }
  }
}
```

## 集成 React 规则的配置

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.2.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    // 使用 .gitignore 文件来忽略文件
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    // 使用空格进行缩进
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      // 对 any 类型的使用发出警告
      "suspicious": {
        "noExplicitAny": "warn",
        "useAwait": "warn",
        // 不准出现 var
        "noVar": "warn"
      },
      "style": {
        // 应当使用 const
        "useConst": "warn",
        // 推荐使用 for...of 而不是传统的 for 循环
        "useForOf": "error",
        // React：仅在专门导出 React 组件的模块内声明组件。为 React Refresh 所必须。
        "useComponentExportOnlyModules": "warn"
      },
      "correctness": {
        // 强制 JSDoc 注释行以单个星号开头，第一个除外。
        "useSingleJsDocAsterisk": "error",
        // 未使用的变量发出警告，但是允许使用 _ 开头的变量名来表示未使用
        "noUnusedVariables": "warn",
        // React：Hook 必须在函数组件或自定义 Hook 的顶层调用
        "useHookAtTopLevel": "warn",
        // React：确保 Hook 的依赖项数组是正确的
        "useExhaustiveDependencies": "warn",
        // React：不允许给 props 赋值
        "noReactPropAssignments": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      // 使用双引号
      "quoteStyle": "double",
      // 在 JSX 中也使用双引号
      "jsxQuoteStyle": "double",
      // 对象和数组的最后一个元素后面添加逗号
      "trailingCommas": "all",
      // 语句末尾总是添加分号
      "semicolons": "always",
      // 箭头函数始终使用括号包裹参数
      "arrowParentheses": "always"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        // 自动组织导入
        "organizeImports": "on"
      }
    }
  }
}
```
