const path=require('path');
const fs=require('fs');

class CpmDetector {
    constructor(options) {
        this.options=options;
        this.cacheRuntime=path.resolve(process.cwd(), './.cpmrc');
        this.load();
    }

    load() {
        this.data={};
    }

    write(update) {
        function mergeContainer(container, updateContainer) {
            for (let i=0; i<updateContainer.length; i++) {
                const updateComponent=updateContainer[i];
                let hit=false;
                for (let j=0; j<container.length; j++) {
                    const component=container[j];
                    if (updateComponent.name==component.name) {
                        mergeComponent(component, updateComponent);
                        hit=true;
                        break;
                    }
                }
                if (!hit) {
                    container.push(updateComponent);
                }
            }
        }
        function mergeComponent(component, updateComponent) {
            for (let file in updateComponent.sources) {
                const sources=component.sources[file];
                const updateSources=updateComponent.sources[file];
                if (updateSources) {
                    component.sources[file]=updateSources;
                }
            }
        }

        for (let containerKey in update) {
            let container=this.data[containerKey];
            let updateContainer=update[containerKey];
            if (containerKey==='parent') {
                mergeComponent(container, updateContainer);
            } else {
                if (container && updateContainer) {
                    mergeContainer(container, updateContainer);
                } else if (updateContainer){
                    this.data[containerKey]=updateContainer;
                }
            }

        }
    }

    save() {
        try {
            let code=JSON.stringify(this.data, null, '\t');
            fs.writeFileSync(this.cacheRuntime, code);
        } catch (e) {

        }
    }

    remove() {
        try {
            fs.unlinkSync(this.cacheRuntime);
        } catch (e) {

        }
    }

    apply(compiler) {
        const self=this;

        compiler.plugin('cpm-component', function (data) {
            self.write(data);
        });
        compiler.plugin('done',function(compilation) {
            self.save();
        });
    }
}
module.exports=CpmDetector;
module.exports.default=CpmDetector;
