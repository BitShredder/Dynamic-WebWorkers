import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default [

    { 
        input: 'src/index.js',
        output: {  
            format: 'iife',
            file: 'test/functional/dynamic-webworkers.js',
            strict: false
        },
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    ['env', { modules: false }]
                ]
            })
        ]
    },

    { 
        input: 'src/index.js',
        output: {  
            format: 'iife',
            file: 'dist/dynamic-webworkers.min.js',
            strict: false
        },
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    ['env', { modules: false }]
                ]
            }),
            uglify.uglify({
                compress: {
                    drop_console: true,
                    hoist_funs: true,
                    hoist_vars: true,
                    negate_iife: false,
                    passes: 2,
                    unsafe_proto: true
                },
                mangle: {
                    keep_fnames: true,
                    eval: true,
                    toplevel: true
                }
            })
        ]
    }
]